import { BlogPost } from '@noxion/types'

export interface OGImageParams {
  title: string
  description?: string
  tags?: string[]
  date?: string
  readingTime?: number
  type?: 'article' | 'homepage' | 'tag'
}

/**
 * Generate OG image URL for a blog post
 */
export function generateOGImageUrl(params: OGImageParams, baseUrl?: string): string {
  const url = new URL('/api/og', baseUrl || 'http://localhost:3000')
  
  // Add parameters
  url.searchParams.set('title', params.title)
  
  if (params.description) {
    url.searchParams.set('description', params.description)
  }
  
  if (params.tags && params.tags.length > 0) {
    url.searchParams.set('tags', params.tags.join(','))
  }
  
  if (params.date) {
    url.searchParams.set('date', params.date)
  }
  
  if (params.readingTime) {
    url.searchParams.set('readingTime', params.readingTime.toString())
  }
  
  if (params.type) {
    url.searchParams.set('type', params.type)
  }
  
  return url.toString()
}

/**
 * Generate OG image URL from a BlogPost
 */
export function generatePostOGImageUrl(post: BlogPost, baseUrl?: string): string {
  return generateOGImageUrl({
    title: post.title,
    description: post.summary,
    tags: post.tags,
    date: post.date,
    readingTime: post.readingTime,
    type: 'article'
  }, baseUrl)
}

/**
 * Generate homepage OG image URL
 */
export function generateHomepageOGImageUrl(baseUrl?: string): string {
  return generateOGImageUrl({
    title: 'Noxion Blog',
    description: 'Insights, tutorials, and thoughts powered by Notion',
    type: 'homepage'
  }, baseUrl)
}

/**
 * Generate tag page OG image URL
 */
export function generateTagOGImageUrl(tag: string, postCount?: number, baseUrl?: string): string {
  return generateOGImageUrl({
    title: `#${tag}`,
    description: postCount 
      ? `${postCount} article${postCount === 1 ? '' : 's'} tagged with ${tag}`
      : `Articles tagged with ${tag}`,
    tags: [tag],
    type: 'tag'
  }, baseUrl)
}

/**
 * Get the base URL for the current environment
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side
    return window.location.origin
  }
  
  // Server-side
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  if (process.env.NODE_ENV === 'production') {
    // Replace with your actual production domain
    return 'https://your-domain.com'
  }
  
  return 'http://localhost:3000'
}

/**
 * Truncate text to fit in OG image
 */
export function truncateForOG(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3).trim() + '...'
}

/**
 * Generate fallback OG metadata for error cases
 */
export function getFallbackOGMetadata(baseUrl?: string) {
  return {
    title: 'Noxion Blog',
    description: 'Notion-powered blog with insights and tutorials',
    images: [
      {
        url: generateHomepageOGImageUrl(baseUrl),
        width: 1200,
        height: 630,
        alt: 'Noxion Blog',
      },
    ],
  }
}

/**
 * Generate complete OG metadata for a blog post
 */
export function generatePostOGMetadata(post: BlogPost, baseUrl?: string) {
  const ogImageUrl = generatePostOGImageUrl(post, baseUrl)
  
  return {
    title: post.title,
    description: truncateForOG(post.summary || 'Read this article on Noxion Blog'),
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: post.title,
      },
    ],
  }
}

/**
 * Generate Twitter Card metadata
 */
export function generateTwitterMetadata(post: BlogPost, baseUrl?: string) {
  const ogImageUrl = generatePostOGImageUrl(post, baseUrl)
  
  return {
    card: 'summary_large_image' as const,
    title: post.title,
    description: truncateForOG(post.summary || 'Read this article on Noxion Blog'),
    images: [ogImageUrl],
  }
}