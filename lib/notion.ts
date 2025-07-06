import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import { 
  NotionPage, 
  BlogPost, 
  NotionDatabaseQueryResponse,
  NotionBlocksResponse 
} from '@/types/notion'
import { NotionAPIError, logError, safeAsync } from '@/lib/error-handling'
import { 
  validateDatabaseResponse, 
  validateNotionPage, 
  createSafeBlogPost,
  NotionPropertyAccessor,
  sanitizeString 
} from '@/lib/validation'
import { 
  getCachedPosts, 
  getCachedPost, 
  getCachedContent,
  CACHE_TTL 
} from '@/lib/cache'

const NOTION_TOKEN = process.env.NOTION_TOKEN
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID

let notion: Client | null = null

if (NOTION_TOKEN) {
  notion = new Client({
    auth: NOTION_TOKEN,
  })
}

const n2m = notion ? new NotionToMarkdown({ notionClient: notion }) : null

function getPlainTextFromRichText(richText: any[]): string {
  return richText
    .map((text) => text.plain_text)
    .join('')
}

function getStringFromProperty(property: any): string {
  if (!property) return ''
  
  switch (property.type) {
    case 'title':
      return getPlainTextFromRichText(property.title)
    case 'rich_text':
      return getPlainTextFromRichText(property.rich_text)
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

function getArrayFromProperty(property: any): string[] {
  if (!property) return []
  
  switch (property.type) {
    case 'multi_select':
      return property.multi_select?.map((item: any) => item.name) || []
    case 'rich_text':
      return [getPlainTextFromRichText(property.rich_text)]
    case 'title':
      return [getPlainTextFromRichText(property.title)]
    default:
      return []
  }
}

function getBooleanFromProperty(property: any): boolean {
  if (!property) return false
  
  switch (property.type) {
    case 'checkbox':
      return property.checkbox
    default:
      return false
  }
}

function getCoverImageUrl(page: NotionPage): string | undefined {
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

function createSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function calculateReadingTime(content: string | undefined): number {
  if (!content || typeof content !== 'string') {
    return 1 // 기본값으로 1분 읽기 시간 설정
  }
  
  const wordsPerMinute = 200
  const trimmedContent = content.trim()
  
  if (!trimmedContent) {
    return 1
  }
  
  const words = trimmedContent.split(/\s+/).length
  const readingTime = Math.ceil(words / wordsPerMinute)
  return Math.max(readingTime, 1) // 최소 1분
}

async function fetchDatabasePagesInternal(): Promise<BlogPost[]> {
  if (!notion || !NOTION_DATABASE_ID) {
    return []
  }

  try {
    const rawResponse = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
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

    // Validate the response structure
    const response = validateDatabaseResponse(rawResponse) 
      ? rawResponse 
      : { object: 'list', results: [], has_more: false, next_cursor: null } as NotionDatabaseQueryResponse

    const posts: BlogPost[] = []

    for (const page of response.results) {
      // Validate page structure
      if (!validateNotionPage(page)) {
        logError(new Error('Invalid page structure'), 'Processing Notion page', { pageId: (page as any)?.id })
        continue
      }

      const accessor = new NotionPropertyAccessor(page.properties)
      
      // Extract properties with validation
      const title = accessor.getString('Title') || accessor.getString('title') || accessor.getString('Name')
      const slug = accessor.getString('Slug') || createSlugFromTitle(title)
      const summary = accessor.getString('Summary') || accessor.getString('Description')
      const published = accessor.getBoolean('Published')
      const date = accessor.getDate('Date') || accessor.getDate('Created') || page.created_time
      const tags = accessor.getStringArray('Tags').concat(accessor.getStringArray('Category'))
      const cover = getCoverImageUrl(page)

      if (title && published) {
        try {
          const content = await getPageContent(page.id)
          
          // Create a safe blog post with validation
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
            readingTime: calculateReadingTime(content),
          }

          const safeBlogPost = createSafeBlogPost(postData)
          posts.push(safeBlogPost)
        } catch (error) {
          logError(error, `Processing page ${page.id}`, { pageId: page.id, title })
          // Try to create a minimal safe post even on error
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
            // Skip this post if we can't even create a fallback
          }
        }
      }
    }

    return posts
  } catch (error) {
    logError(error, 'Fetching database pages', { databaseId: NOTION_DATABASE_ID })
    throw new NotionAPIError('Failed to fetch blog posts from Notion', 'DATABASE_QUERY_ERROR', error)
  }
}

export async function getDatabasePages(): Promise<BlogPost[]> {
  return getCachedPosts(fetchDatabasePagesInternal, 'posts:all', CACHE_TTL.POSTS)
}

async function fetchPageContentInternal(pageId: string): Promise<string> {
  if (!n2m) {
    logError(new Error('NotionToMarkdown not initialized'), 'getPageContent', { pageId })
    return ''
  }

  if (!sanitizeString(pageId)) {
    logError(new Error('Invalid pageId provided'), 'getPageContent', { pageId })
    return ''
  }

  try {
    const mdBlocks = await n2m.pageToMarkdown(pageId)
    const mdString = n2m.toMarkdownString(mdBlocks)
    
    // Validate and sanitize the returned content
    const content = mdString?.parent || ''
    return sanitizeString(content)
  } catch (error) {
    logError(error, 'Fetching page content', { pageId })
    return '' // 에러 발생 시 빈 문자열 반환
  }
}

export async function getPageContent(pageId: string): Promise<string> {
  return getCachedContent(() => fetchPageContentInternal(pageId), pageId, CACHE_TTL.CONTENT)
}

async function fetchPageBySlugInternal(slug: string): Promise<BlogPost | null> {
  if (!notion || !NOTION_DATABASE_ID) {
    logError(new Error('Notion client or database ID not configured'), 'getPageBySlug', { slug })
    return null
  }

  if (!sanitizeString(slug)) {
    logError(new Error('Invalid slug provided'), 'getPageBySlug', { slug })
    return null
  }

  try {
    const rawResponse = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
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

    // Validate response structure
    const response = validateDatabaseResponse(rawResponse)
      ? rawResponse
      : { object: 'list', results: [], has_more: false, next_cursor: null } as NotionDatabaseQueryResponse

    if (response.results.length === 0) {
      // Fallback: search by title-generated slug
      const allPages = await getDatabasePages()
      const pageByTitleSlug = allPages.find(page => 
        createSlugFromTitle(page.title) === slug
      )
      
      return pageByTitleSlug || null
    }

    const page = response.results[0]
    
    // Validate page structure
    if (!validateNotionPage(page)) {
      logError(new Error('Invalid page structure'), 'getPageBySlug', { slug, pageId: (page as any)?.id })
      return null
    }

    const accessor = new NotionPropertyAccessor(page.properties)
    
    // Extract properties with validation
    const title = accessor.getString('Title') || accessor.getString('title') || accessor.getString('Name')
    const summary = accessor.getString('Summary') || accessor.getString('Description')
    const published = accessor.getBoolean('Published')
    const date = accessor.getDate('Date') || accessor.getDate('Created') || page.created_time
    const tags = accessor.getStringArray('Tags').concat(accessor.getStringArray('Category'))
    const cover = getCoverImageUrl(page)

    const content = await getPageContent(page.id)

    // Create and validate safe blog post
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
      readingTime: calculateReadingTime(content),
    }

    return createSafeBlogPost(postData)
  } catch (error) {
    logError(error, 'Fetching page by slug', { slug, databaseId: NOTION_DATABASE_ID })
    return null
  }
}

export async function getPageBySlug(slug: string): Promise<BlogPost | null> {
  return getCachedPost(() => fetchPageBySlugInternal(slug), slug, CACHE_TTL.POST)
}

export async function getAllSlugs(): Promise<string[]> {
  try {
    const posts = await getDatabasePages()
    return posts.map(post => post.slug)
  } catch (error) {
    logError(error, 'Fetching all slugs', { databaseId: NOTION_DATABASE_ID })
    return []
  }
}