# Noxion API Reference

## Overview

Noxion provides a clean abstraction layer over the Notion API, making it easy to fetch and transform Notion content into blog posts. All API functions are located in `lib/notion.ts`.

## Core Functions

### `getDatabasePages()`

Fetches all published blog posts from the configured Notion database.

```typescript
async function getDatabasePages(): Promise<BlogPost[]>
```

**Behavior:**
- Filters posts by `Published: true`
- Sorts by date in descending order (newest first)
- Maps Notion properties to `BlogPost` interface
- Handles flexible property naming

**Returns:**
```typescript
BlogPost[] // Array of blog post metadata (without content)
```

**Example Usage:**
```typescript
import { getDatabasePages } from '@/lib/notion'

// In a React Server Component
async function BlogList() {
  const posts = await getDatabasePages()
  
  return (
    <div>
      {posts.map(post => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  )
}
```

**Error Handling:**
- Returns empty array if no Notion credentials
- Throws error if API request fails
- Logs errors to console in development

---

### `getPageContent()`

Converts a Notion page to markdown format.

```typescript
async function getPageContent(pageId: string): Promise<string>
```

**Parameters:**
- `pageId`: The Notion page ID (UUID format)

**Returns:**
```typescript
string // Markdown content of the page
```

**Features:**
- Uses `notion-to-md` for conversion
- Preserves formatting, links, and media
- Handles nested blocks and databases
- Converts Notion blocks to standard markdown

**Example Usage:**
```typescript
import { getPageContent } from '@/lib/notion'

async function getPost(id: string) {
  const content = await getPageContent(id)
  // content is now markdown string
  return content
}
```

---

### `getPageBySlug()`

Retrieves a complete blog post by its URL slug.

```typescript
async function getPageBySlug(slug: string): Promise<BlogPost | null>
```

**Parameters:**
- `slug`: URL-friendly identifier for the post

**Returns:**
```typescript
BlogPost | null // Complete blog post with content, or null if not found
```

**Slug Resolution Strategy:**
1. **Exact Match**: First tries to find a post with matching `Slug` property
2. **Title Fallback**: If no exact match, generates slug from title and compares
3. **Not Found**: Returns `null` if no match found

**Auto-generated Slugs:**
- Converts title to lowercase
- Replaces spaces with hyphens
- Removes special characters
- Handles multiple consecutive hyphens

**Example Usage:**
```typescript
import { getPageBySlug } from '@/lib/notion'

// In a dynamic route [slug]/page.tsx
async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPageBySlug(params.slug)
  
  if (!post) {
    notFound() // Next.js 404
  }
  
  return <BlogPostContent post={post} />
}
```

---

### `getAllSlugs()`

Gets all available post slugs for static site generation.

```typescript
async function getAllSlugs(): Promise<string[]>
```

**Returns:**
```typescript
string[] // Array of all post slugs
```

**Usage in Static Generation:**
```typescript
import { getAllSlugs } from '@/lib/notion'

// Generate static params for all blog posts
export async function generateStaticParams() {
  const slugs = await getAllSlugs()
  
  return slugs.map((slug) => ({
    slug: slug,
  }))
}
```

## Utility Functions

### Property Extraction Functions

These internal functions handle the flexible Notion property schema:

#### `getStringFromProperty(property: any): string`

Extracts string values from various Notion property types:
- `title`: Page title
- `rich_text`: Formatted text
- `select`: Single selection
- `multi_select`: Multiple selections (joined with commas)
- `date`: Date strings
- `url`, `email`, `phone_number`: Direct values
- `number`, `checkbox`: Converted to string

#### `getArrayFromProperty(property: any): string[]`

Extracts array values from Notion properties:
- `multi_select`: Array of selection names
- `rich_text`, `title`: Single-item array
- Other types: Empty array

#### `getBooleanFromProperty(property: any): boolean`

Extracts boolean values from Notion checkbox properties.

### Content Processing Functions

#### `getCoverImageUrl(page: NotionPage): string | undefined`

Extracts cover image URLs from Notion pages:
- Handles both external and uploaded images
- Returns `undefined` if no cover image

#### `createSlugFromTitle(title: string): string`

Generates URL-friendly slugs from titles:
```typescript
createSlugFromTitle("My First Blog Post!") 
// Returns: "my-first-blog-post"
```

#### `calculateReadingTime(content: string): number`

Estimates reading time based on word count:
- Assumes 200 words per minute
- Rounds up to nearest minute
- Counts words by splitting on whitespace

## TypeScript Interfaces

### `BlogPost`

Main interface for blog post data:

```typescript
interface BlogPost {
  id: string              // Notion page ID
  title: string           // Post title
  slug: string            // URL slug
  summary: string         // Post excerpt/description
  published: boolean      // Publication status
  date: string           // Publication date (ISO string)
  tags: string[]         // Array of tags/categories
  cover?: string         // Cover image URL (optional)
  content?: string       // Markdown content (optional)
  lastEditedTime: string // Last edit timestamp
  readingTime?: number   // Estimated reading time in minutes
}
```

### `NotionPage`

Raw Notion page structure:

```typescript
interface NotionPage {
  id: string
  created_time: string
  last_edited_time: string
  cover: {
    type: string
    [key: string]: any
  } | null
  properties: {
    [key: string]: NotionPageProperty
  }
  // ... other Notion page fields
}
```

## Error Handling

### Common Error Scenarios

1. **Missing Credentials**
   ```typescript
   if (!notion || !NOTION_DATABASE_ID) {
     return [] // Gracefully return empty results
   }
   ```

2. **API Errors**
   ```typescript
   try {
     const response = await notion.databases.query(...)
   } catch (error) {
     console.error('Error fetching database pages:', error)
     throw error // Re-throw for upstream handling
   }
   ```

3. **Invalid Page ID**
   ```typescript
   try {
     const content = await getPageContent(pageId)
   } catch (error) {
     console.error('Error fetching page content:', error)
     return '' // Return empty content
   }
   ```

### Error Types

- **Authentication Errors**: Invalid or missing Notion token
- **Permission Errors**: Integration lacks access to database
- **Not Found Errors**: Page or database doesn't exist
- **Rate Limit Errors**: Too many API requests
- **Network Errors**: Connection issues

## Configuration

### Environment Variables

Required for API functionality:

```bash
NOTION_TOKEN=secret_...        # Notion integration token
NOTION_DATABASE_ID=abc123...   # Target database ID
```

### Client Initialization

```typescript
const notion = new Client({
  auth: NOTION_TOKEN,
})

const n2m = new NotionToMarkdown({ 
  notionClient: notion 
})
```

### Database Schema Requirements

The API expects these Notion database properties (with flexible naming):

| Expected | Alternatives | Type | Required |
|----------|-------------|------|----------|
| Title | Name | Title | ✅ |
| Published | - | Checkbox | ✅ |
| Date | Created | Date | ✅ |
| Slug | - | Rich Text | ❌ |
| Summary | Description | Rich Text | ❌ |
| Tags | Category | Multi-select | ❌ |

## Performance Considerations

### Caching Strategy

- **ISR (Incremental Static Regeneration)**: Pages revalidate every hour
- **Static Generation**: Build-time generation for known posts
- **On-demand**: Dynamic pages for new content

### Request Optimization

- **Batch Requests**: Multiple posts fetched in single database query
- **Selective Fields**: Only fetch required properties
- **Pagination**: Handle large databases with cursor-based pagination

### Rate Limiting

Notion API limits:
- 3 requests per second per integration
- Built-in retry logic in `@notionhq/client`
- Graceful degradation on rate limit errors

## Migration Guide

### From Previous Versions

If migrating from an older setup:

1. **Update Property Names**: Check your database schema matches expected names
2. **Environment Variables**: Ensure all required variables are set
3. **Type Definitions**: Update imports to use new TypeScript interfaces
4. **Error Handling**: Wrap API calls in try-catch blocks

### Custom Property Names

To use different property names, modify the property extraction in `lib/notion.ts`:

```typescript
// Custom property mapping
const title = getStringFromProperty(
  page.properties.CustomTitle || 
  page.properties.Title
)
```

## Examples

### Complete Blog Post Fetching

```typescript
import { getPageBySlug, getDatabasePages } from '@/lib/notion'

// Get all posts for listing
export async function getBlogPosts() {
  return await getDatabasePages()
}

// Get single post with content
export async function getBlogPost(slug: string) {
  const post = await getPageBySlug(slug)
  
  if (!post) {
    throw new Error(`Post not found: ${slug}`)
  }
  
  return post
}

// Generate static paths
export async function getStaticPaths() {
  const posts = await getDatabasePages()
  
  return {
    paths: posts.map(post => ({
      params: { slug: post.slug }
    })),
    fallback: 'blocking' // Enable ISR for new posts
  }
}
```

### Custom Content Processing

```typescript
import { getPageContent } from '@/lib/notion'

// Add custom processing to content
export async function getProcessedContent(pageId: string) {
  const rawContent = await getPageContent(pageId)
  
  // Custom transformations
  const processedContent = rawContent
    .replace(/\[todo\]/g, '☐') // Custom syntax
    .replace(/\[done\]/g, '☑️') // Custom syntax
  
  return processedContent
}
```

## Best Practices

1. **Error Boundaries**: Wrap API calls in error boundaries
2. **Loading States**: Use Suspense for async components
3. **Type Safety**: Always use TypeScript interfaces
4. **Caching**: Leverage Next.js caching strategies
5. **Fallbacks**: Provide graceful fallbacks for missing data
6. **Validation**: Validate environment variables at startup