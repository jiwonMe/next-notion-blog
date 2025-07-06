import { Metadata } from 'next'
import { BlogPost } from '@/types/notion'
import { 
  generatePostOGImageUrl, 
  generateHomepageOGImageUrl, 
  generateOGImageUrl,
  getBaseUrl,
  truncateForOG
} from './og-image'

export interface MetadataConfig {
  title: string
  description: string
  keywords?: string[]
  authors?: { name: string }[]
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  tags?: string[]
}

/**
 * Generate complete Next.js metadata object with consistent defaults
 */
export function generateMetadata(config: MetadataConfig): Metadata {
  const baseUrl = getBaseUrl()
  const siteName = 'Noxion Blog'
  
  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    authors: config.authors || [{ name: 'Noxion' }],
    openGraph: {
      title: config.title,
      description: config.description,
      type: config.type || 'website',
      images: config.image ? [
        {
          url: config.image,
          width: 1200,
          height: 630,
          alt: config.title,
        }
      ] : undefined,
      url: config.url || baseUrl,
      siteName,
      ...(config.type === 'article' && {
        publishedTime: config.publishedTime,
        modifiedTime: config.modifiedTime,
        tags: config.tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
      images: config.image ? [config.image] : undefined,
    },
    alternates: {
      canonical: config.url || baseUrl,
    },
  }
}

/**
 * Generate metadata for the homepage
 */
export function generateHomepageMetadata(): Metadata {
  const baseUrl = getBaseUrl()
  
  return generateMetadata({
    title: 'Noxion Blog - Write in Notion, Publish Beautifully',
    description: 'Transform your Notion pages into a stunning blog. Share your thoughts, stories, and insights with the world.',
    keywords: ['notion', 'blog', 'writing', 'publishing', 'nextjs'],
    image: generateHomepageOGImageUrl(baseUrl),
    url: baseUrl,
    type: 'website',
  })
}

/**
 * Generate metadata for the articles listing page
 */
export function generateArticlesMetadata(): Metadata {
  const baseUrl = getBaseUrl()
  
  return generateMetadata({
    title: 'All Articles | Noxion Blog',
    description: 'Browse all articles and blog posts from our Notion-powered blog. Discover insights, tutorials, and stories.',
    keywords: ['articles', 'blog posts', 'tutorials', 'insights'],
    image: generateOGImageUrl({
      title: 'All Articles',
      description: 'Browse all articles and blog posts from our Notion-powered blog',
      type: 'homepage'
    }, baseUrl),
    url: `${baseUrl}/articles`,
    type: 'website',
  })
}

/**
 * Generate metadata for individual blog posts
 */
export function generatePostMetadata(post: BlogPost): Metadata {
  const baseUrl = getBaseUrl()
  
  return generateMetadata({
    title: post.title,
    description: post.summary || `Read ${post.title} on Noxion`,
    keywords: post.tags,
    image: generatePostOGImageUrl(post, baseUrl),
    url: `${baseUrl}/articles/${post.slug}`,
    type: 'article',
    publishedTime: post.date,
    modifiedTime: post.lastEditedTime,
    tags: post.tags,
  })
}

/**
 * Generate metadata for tag pages
 */
export function generateTagMetadata(tag: string, postCount?: number): Metadata {
  const baseUrl = getBaseUrl()
  const description = postCount 
    ? `Browse ${postCount} article${postCount === 1 ? '' : 's'} tagged with "${tag}"`
    : `Articles tagged with "${tag}"`
  
  return generateMetadata({
    title: `#${tag} | Noxion Blog`,
    description,
    keywords: [tag, 'articles', 'blog posts'],
    image: generateOGImageUrl({
      title: `#${tag}`,
      description,
      tags: [tag],
      type: 'tag'
    }, baseUrl),
    url: `${baseUrl}/tags/${tag}`,
    type: 'website',
  })
}

/**
 * Generate metadata for error pages
 */
export function generateErrorMetadata(errorType: 'not-found' | 'error' = 'error'): Metadata {
  const baseUrl = getBaseUrl()
  
  const config = errorType === 'not-found' 
    ? {
        title: 'Page Not Found | Noxion Blog',
        description: 'The page you are looking for could not be found.',
      }
    : {
        title: 'Something went wrong | Noxion Blog',
        description: 'An error occurred while loading this page.',
      }
  
  return generateMetadata({
    ...config,
    image: generateHomepageOGImageUrl(baseUrl),
    url: baseUrl,
    type: 'website',
  })
}

/**
 * Generate metadata for the about page
 */
export function generateAboutMetadata(): Metadata {
  const baseUrl = getBaseUrl()
  
  return generateMetadata({
    title: 'About | Noxion Blog',
    description: 'Learn more about Noxion Blog, a Notion-powered publishing platform that makes it easy to share your ideas with the world.',
    keywords: ['about', 'notion', 'blog', 'publishing'],
    image: generateOGImageUrl({
      title: 'About Noxion',
      description: 'Notion-powered blog platform',
      type: 'homepage'
    }, baseUrl),
    url: `${baseUrl}/about`,
    type: 'website',
  })
}

/**
 * Safe metadata generation with fallback for errors
 */
export function generateSafeMetadata(
  generator: () => Metadata,
  fallback?: MetadataConfig
): Metadata {
  try {
    return generator()
  } catch (error) {
    console.error('Error generating metadata:', error)
    
    if (fallback) {
      return generateMetadata(fallback)
    }
    
    // Ultimate fallback
    return generateMetadata({
      title: 'Noxion Blog',
      description: 'Notion-powered blog with insights and tutorials',
      image: generateHomepageOGImageUrl(),
      type: 'website',
    })
  }
}