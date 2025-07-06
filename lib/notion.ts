import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import { 
  NotionPage, 
  BlogPost, 
  NotionDatabaseQueryResponse,
  NotionBlocksResponse 
} from '@/types/notion'

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

export async function getDatabasePages(): Promise<BlogPost[]> {
  if (!notion || !NOTION_DATABASE_ID) {
    return []
  }

  try {
    const response = await notion.databases.query({
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
    }) as NotionDatabaseQueryResponse

    const posts: BlogPost[] = []

    for (const page of response.results) {
      const title = getStringFromProperty(page.properties.Title || page.properties.title || page.properties.Name)
      const slug = getStringFromProperty(page.properties.Slug) || createSlugFromTitle(title)
      const summary = getStringFromProperty(page.properties.Summary || page.properties.Description)
      const published = getBooleanFromProperty(page.properties.Published)
      const date = getStringFromProperty(page.properties.Date || page.properties.Created)
      const tags = getArrayFromProperty(page.properties.Tags || page.properties.Category)
      const cover = getCoverImageUrl(page)

      if (title && published) {
        try {
          const content = await getPageContent(page.id)
          
          posts.push({
            id: page.id,
            title,
            slug,
            summary,
            published,
            date: date || page.created_time,
            tags,
            cover,
            content: content || '', // content가 undefined일 경우 빈 문자열 사용
            lastEditedTime: page.last_edited_time,
            readingTime: calculateReadingTime(content),
          })
        } catch (error) {
          console.error(`Error fetching content for page ${page.id}:`, error)
          // content를 가져오지 못한 경우에도 포스트는 추가
          posts.push({
            id: page.id,
            title,
            slug,
            summary,
            published,
            date: date || page.created_time,
            tags,
            cover,
            content: '', // 에러 시 빈 문자열
            lastEditedTime: page.last_edited_time,
            readingTime: 1, // 기본 읽기 시간 1분
          })
        }
      }
    }

    return posts
  } catch (error) {
    console.error('Error fetching database pages:', error)
    throw error
  }
}

export async function getPageContent(pageId: string): Promise<string> {
  if (!n2m) {
    return ''
  }

  try {
    const mdBlocks = await n2m.pageToMarkdown(pageId)
    const mdString = n2m.toMarkdownString(mdBlocks)
    
    // mdString.parent가 undefined일 수 있으므로 안전하게 처리
    return mdString?.parent || ''
  } catch (error) {
    console.error('Error fetching page content:', error)
    return '' // 에러 발생 시 빈 문자열 반환
  }
}

export async function getPageBySlug(slug: string): Promise<BlogPost | null> {
  if (!notion || !NOTION_DATABASE_ID) {
    return null
  }

  try {
    const response = await notion.databases.query({
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
    }) as NotionDatabaseQueryResponse

    if (response.results.length === 0) {
      const allPages = await getDatabasePages()
      const pageByTitleSlug = allPages.find(page => 
        createSlugFromTitle(page.title) === slug
      )
      
      if (pageByTitleSlug) {
        const content = await getPageContent(pageByTitleSlug.id)
        return {
          ...pageByTitleSlug,
          content: content || '',
          readingTime: calculateReadingTime(content),
        }
      }
      
      return null
    }

    const page = response.results[0]
    const title = getStringFromProperty(page.properties.Title || page.properties.title || page.properties.Name)
    const summary = getStringFromProperty(page.properties.Summary || page.properties.Description)
    const published = getBooleanFromProperty(page.properties.Published)
    const date = getStringFromProperty(page.properties.Date || page.properties.Created)
    const tags = getArrayFromProperty(page.properties.Tags || page.properties.Category)
    const cover = getCoverImageUrl(page)

    const content = await getPageContent(page.id)

    return {
      id: page.id,
      title,
      slug,
      summary,
      published,
      date: date || page.created_time,
      tags,
      cover,
      content: content || '',
      lastEditedTime: page.last_edited_time,
      readingTime: calculateReadingTime(content),
    }
  } catch (error) {
    console.error('Error fetching page by slug:', error)
    return null
  }
}

export async function getAllSlugs(): Promise<string[]> {
  try {
    const posts = await getDatabasePages()
    return posts.map(post => post.slug)
  } catch (error) {
    console.error('Error fetching all slugs:', error)
    return []
  }
}