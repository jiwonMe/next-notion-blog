import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import { 
  NotionPage, 
  BlogPost, 
  NotionDatabaseQueryResponse,
  NotionBlocksResponse 
} from '@noxion/types'
import { NotionAPIError, logError, safeAsync } from './error-handling'
import { 
  validateDatabaseResponse, 
  validateNotionPage, 
  createSafeBlogPost,
  NotionPropertyAccessor,
  sanitizeString 
} from './validation'
import { 
  getCachedPosts, 
  getCachedPost, 
  getCachedContent,
  CACHE_TTL 
} from './cache'

export class NotionClient {
  private client: Client | null = null
  private n2m: NotionToMarkdown | null = null
  private databaseId: string | null = null

  constructor(token?: string, databaseId?: string) {
    if (token) {
      this.client = new Client({ auth: token })
      this.n2m = new NotionToMarkdown({ notionClient: this.client })
    }
    this.databaseId = databaseId || null
  }

  private getPlainTextFromRichText(richText: any[]): string {
    return richText
      .map((text) => text.plain_text)
      .join('')
  }

  private getStringFromProperty(property: any): string {
    if (!property) return ''
    
    switch (property.type) {
      case 'title':
        return this.getPlainTextFromRichText(property.title)
      case 'rich_text':
        return this.getPlainTextFromRichText(property.rich_text)
      case 'select':
        return property.select?.name || ''
      case 'multi_select':
        return property.multi_select?.map((item: any) => item.name).join(', ') || ''
      case 'date':
        return property.date?.start || ''
      case 'checkbox':
        return property.checkbox.toString()
      case 'number':
        return property.number?.toString() || ''
      case 'url':
        return property.url || ''
      case 'email':
        return property.email || ''
      case 'phone_number':
        return property.phone_number || ''
      default:
        return ''
    }
  }

  private getArrayFromProperty(property: any): string[] {
    if (!property) return []
    
    switch (property.type) {
      case 'multi_select':
        return property.multi_select?.map((item: any) => item.name) || []
      case 'rich_text':
        return [this.getPlainTextFromRichText(property.rich_text)]
      case 'title':
        return [this.getPlainTextFromRichText(property.title)]
      default:
        return []
    }
  }

  private getBooleanFromProperty(property: any): boolean {
    if (!property) return false
    
    switch (property.type) {
      case 'checkbox':
        return property.checkbox
      default:
        return false
    }
  }

  private getCoverImageUrl(page: NotionPage): string | undefined {
    if (page.cover) {
      switch (page.cover.type) {
        case 'external':
          return page.cover.external.url
        case 'file':
          return page.cover.file.url
        default:
          return undefined
      }
    }
    return undefined
  }

  private createSlugFromTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  private calculateReadingTime(content: string | undefined): number {
    if (!content || typeof content !== 'string') {
      return 1
    }
    
    const wordsPerMinute = 200
    const trimmedContent = content.trim()
    
    if (!trimmedContent) {
      return 1
    }
    
    const words = trimmedContent.split(/\s+/).length
    const readingTime = Math.ceil(words / wordsPerMinute)
    return Math.max(readingTime, 1)
  }

  private async fetchDatabasePagesInternal(): Promise<BlogPost[]> {
    if (!this.client || !this.databaseId) {
      return []
    }

    try {
      const rawResponse = await this.client.databases.query({
        database_id: this.databaseId,
        filter: {
          property: 'Published',
          checkbox: {
            equals: true,
          },
        },
        sorts: [
          {
            property: 'Date',
            direction: 'descending',
          },
        ],
      })

      const response = validateDatabaseResponse(rawResponse) 
        ? rawResponse 
        : { object: 'list', results: [], has_more: false, next_cursor: null } as NotionDatabaseQueryResponse

      const posts: BlogPost[] = []

      for (const page of response.results) {
        if (!validateNotionPage(page)) {
          logError(new Error('Invalid page structure'), 'Processing Notion page', { pageId: (page as any)?.id })
          continue
        }

        const accessor = new NotionPropertyAccessor(page.properties)
        
        const title = accessor.getString('Title') || accessor.getString('title') || accessor.getString('Name')
        const slug = accessor.getString('Slug') || this.createSlugFromTitle(title)
        const summary = accessor.getString('Summary') || accessor.getString('Description')
        const published = accessor.getBoolean('Published')
        const date = accessor.getDate('Date') || accessor.getDate('Created') || page.created_time
        const tags = accessor.getStringArray('Tags').concat(accessor.getStringArray('Category'))
        const cover = this.getCoverImageUrl(page)

        if (title && published) {
          try {
            const content = await this.getPageContent(page.id)
            
            const postData = {
              id: page.id,
              title,
              slug,
              summary,
              published,
              date,
              tags,
              cover,
              content: content || '',
              lastEditedTime: page.last_edited_time,
              readingTime: this.calculateReadingTime(content),
            }

            const safeBlogPost = createSafeBlogPost(postData)
            posts.push(safeBlogPost)
          } catch (error) {
            logError(error, `Processing page ${page.id}`, { pageId: page.id, title })
            try {
              const fallbackPost = createSafeBlogPost({
                id: page.id,
                title,
                slug,
                summary,
                published,
                date,
                tags,
                cover,
                content: '',
                lastEditedTime: page.last_edited_time,
                readingTime: 1,
              })
              posts.push(fallbackPost)
            } catch (validationError) {
              logError(validationError, `Failed to create fallback post for ${page.id}`, { pageId: page.id })
            }
          }
        }
      }

      return posts
    } catch (error) {
      logError(error, 'Fetching database pages', { databaseId: this.databaseId })
      throw new NotionAPIError('Failed to fetch blog posts from Notion', 'DATABASE_QUERY_ERROR', error)
    }
  }

  async getDatabasePages(): Promise<BlogPost[]> {
    return getCachedPosts(() => this.fetchDatabasePagesInternal(), 'posts:all', CACHE_TTL.POSTS)
  }

  private async fetchPageContentInternal(pageId: string): Promise<string> {
    if (!this.n2m) {
      logError(new Error('NotionToMarkdown not initialized'), 'getPageContent', { pageId })
      return ''
    }

    if (!sanitizeString(pageId)) {
      logError(new Error('Invalid pageId provided'), 'getPageContent', { pageId })
      return ''
    }

    try {
      const mdBlocks = await this.n2m.pageToMarkdown(pageId)
      const mdString = this.n2m.toMarkdownString(mdBlocks)
      
      const content = mdString?.parent || ''
      return sanitizeString(content)
    } catch (error) {
      logError(error, 'Fetching page content', { pageId })
      return ''
    }
  }

  async getPageContent(pageId: string): Promise<string> {
    return getCachedContent(() => this.fetchPageContentInternal(pageId), pageId, CACHE_TTL.CONTENT)
  }

  private async fetchPageBySlugInternal(slug: string): Promise<BlogPost | null> {
    if (!this.client || !this.databaseId) {
      logError(new Error('Notion client or database ID not configured'), 'getPageBySlug', { slug })
      return null
    }

    if (!sanitizeString(slug)) {
      logError(new Error('Invalid slug provided'), 'getPageBySlug', { slug })
      return null
    }

    try {
      const rawResponse = await this.client.databases.query({
        database_id: this.databaseId,
        filter: {
          and: [
            {
              property: 'Published',
              checkbox: {
                equals: true,
              },
            },
            {
              property: 'Slug',
              rich_text: {
                equals: slug,
              },
            },
          ],
        },
      })

      const response = validateDatabaseResponse(rawResponse)
        ? rawResponse
        : { object: 'list', results: [], has_more: false, next_cursor: null } as NotionDatabaseQueryResponse

      if (response.results.length === 0) {
        const allPages = await this.getDatabasePages()
        const pageByTitleSlug = allPages.find(page => 
          this.createSlugFromTitle(page.title) === slug
        )
        
        return pageByTitleSlug || null
      }

      const page = response.results[0]
      
      if (!validateNotionPage(page)) {
        logError(new Error('Invalid page structure'), 'getPageBySlug', { slug, pageId: (page as any)?.id })
        return null
      }

      const accessor = new NotionPropertyAccessor(page.properties)
      
      const title = accessor.getString('Title') || accessor.getString('title') || accessor.getString('Name')
      const summary = accessor.getString('Summary') || accessor.getString('Description')
      const published = accessor.getBoolean('Published')
      const date = accessor.getDate('Date') || accessor.getDate('Created') || page.created_time
      const tags = accessor.getStringArray('Tags').concat(accessor.getStringArray('Category'))
      const cover = this.getCoverImageUrl(page)

      const content = await this.getPageContent(page.id)

      const postData = {
        id: page.id,
        title,
        slug,
        summary,
        published,
        date,
        tags,
        cover,
        content: content || '',
        lastEditedTime: page.last_edited_time,
        readingTime: this.calculateReadingTime(content),
      }

      return createSafeBlogPost(postData)
    } catch (error) {
      logError(error, 'Fetching page by slug', { slug, databaseId: this.databaseId })
      return null
    }
  }

  async getPageBySlug(slug: string): Promise<BlogPost | null> {
    return getCachedPost(() => this.fetchPageBySlugInternal(slug), slug, CACHE_TTL.POST)
  }

  async getAllSlugs(): Promise<string[]> {
    try {
      const posts = await this.getDatabasePages()
      return posts.map(post => post.slug)
    } catch (error) {
      logError(error, 'Fetching all slugs', { databaseId: this.databaseId })
      return []
    }
  }
}