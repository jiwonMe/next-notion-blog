import { BlogPost } from '@/types/notion'
import { logError } from './error-handling'

/**
 * Simple in-memory cache with TTL support
 */
class MemoryCache<T> {
  private cache = new Map<string, { data: T; timestamp: number; ttl: number }>()

  set(key: string, data: T, ttlSeconds: number = 300): void {
    const timestamp = Date.now()
    const ttl = ttlSeconds * 1000
    this.cache.set(key, { data, timestamp, ttl })
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    const isExpired = Date.now() - item.timestamp > item.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    const entriesToDelete: string[] = []
    
    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        entriesToDelete.push(key)
      }
    })
    
    entriesToDelete.forEach(key => this.cache.delete(key))
  }
}

// Global cache instances
const postsCache = new MemoryCache<BlogPost[]>()
const postCache = new MemoryCache<BlogPost>()
const contentCache = new MemoryCache<string>()

// Cache TTL configurations (in seconds)
export const CACHE_TTL = {
  POSTS: 300, // 5 minutes
  POST: 600, // 10 minutes  
  CONTENT: 900, // 15 minutes
  STATIC: 3600, // 1 hour for static content like slugs
} as const

/**
 * Generate cache key for posts list
 */
export function getPostsListCacheKey(): string {
  return 'posts:all'
}

/**
 * Generate cache key for individual post
 */
export function getPostCacheKey(slug: string): string {
  return `post:${slug}`
}

/**
 * Generate cache key for post content
 */
export function getContentCacheKey(pageId: string): string {
  return `content:${pageId}`
}

/**
 * Cache wrapper for posts list
 */
export async function getCachedPosts<T extends BlogPost[]>(
  fetcher: () => Promise<T>,
  cacheKey: string = getPostsListCacheKey(),
  ttl: number = CACHE_TTL.POSTS
): Promise<T> {
  try {
    // Try to get from cache first
    const cached = postsCache.get(cacheKey) as T | null
    if (cached) {
      return cached
    }

    // Fetch fresh data
    const data = await fetcher()
    
    // Cache the result
    postsCache.set(cacheKey, data, ttl)
    
    return data
  } catch (error) {
    logError(error, 'getCachedPosts', { cacheKey })
    throw error
  }
}

/**
 * Cache wrapper for individual post
 */
export async function getCachedPost(
  fetcher: () => Promise<BlogPost | null>,
  slug: string,
  ttl: number = CACHE_TTL.POST
): Promise<BlogPost | null> {
  try {
    const cacheKey = getPostCacheKey(slug)
    
    // Try to get from cache first
    const cached = postCache.get(cacheKey)
    if (cached) {
      return cached
    }

    // Fetch fresh data
    const data = await fetcher()
    
    // Cache the result (even if null, to avoid repeated failed requests)
    if (data) {
      postCache.set(cacheKey, data, ttl)
    }
    
    return data
  } catch (error) {
    logError(error, 'getCachedPost', { slug })
    throw error
  }
}

/**
 * Cache wrapper for post content
 */
export async function getCachedContent(
  fetcher: () => Promise<string>,
  pageId: string,
  ttl: number = CACHE_TTL.CONTENT
): Promise<string> {
  try {
    const cacheKey = getContentCacheKey(pageId)
    
    // Try to get from cache first
    const cached = contentCache.get(cacheKey)
    if (cached !== null) {
      return cached
    }

    // Fetch fresh data
    const data = await fetcher()
    
    // Cache the result
    contentCache.set(cacheKey, data, ttl)
    
    return data
  } catch (error) {
    logError(error, 'getCachedContent', { pageId })
    throw error
  }
}

/**
 * Invalidate cache for a specific post
 */
export function invalidatePostCache(slug: string): void {
  const postKey = getPostCacheKey(slug)
  postCache.delete(postKey)
  
  // Also invalidate posts list cache since it contains this post
  postsCache.delete(getPostsListCacheKey())
}

/**
 * Invalidate content cache for a specific page
 */
export function invalidateContentCache(pageId: string): void {
  const contentKey = getContentCacheKey(pageId)
  contentCache.delete(contentKey)
}

/**
 * Invalidate all posts-related cache
 */
export function invalidateAllPostsCache(): void {
  postsCache.clear()
  postCache.clear()
}

/**
 * Invalidate all content cache
 */
export function invalidateAllContentCache(): void {
  contentCache.clear()
}

/**
 * Invalidate all cache
 */
export function invalidateAllCache(): void {
  postsCache.clear()
  postCache.clear()
  contentCache.clear()
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    posts: postsCache.size(),
    post: postCache.size(),
    content: contentCache.size(),
    total: postsCache.size() + postCache.size() + contentCache.size(),
  }
}

/**
 * Cleanup expired entries from all caches
 */
export function cleanupExpiredCache(): void {
  postsCache.cleanup()
  postCache.cleanup()
  contentCache.cleanup()
}

/**
 * Background cache cleanup (run periodically)
 */
export function startCacheCleanup(intervalMs: number = 60000): NodeJS.Timeout {
  return setInterval(() => {
    cleanupExpiredCache()
  }, intervalMs)
}

/**
 * Preload cache with initial data
 */
export async function preloadCache(
  postsLoader: () => Promise<BlogPost[]>
): Promise<void> {
  try {
    const posts = await postsLoader()
    postsCache.set(getPostsListCacheKey(), posts, CACHE_TTL.POSTS)
    
    // Optionally preload individual posts
    posts.slice(0, 5).forEach(post => {
      postCache.set(getPostCacheKey(post.slug), post, CACHE_TTL.POST)
    })
  } catch (error) {
    logError(error, 'preloadCache')
  }
}

/**
 * Smart cache invalidation based on post update times
 */
export function shouldInvalidateCache(
  lastFetch: number,
  lastUpdate: string,
  maxAge: number = CACHE_TTL.POSTS * 1000
): boolean {
  const updateTime = new Date(lastUpdate).getTime()
  const cacheAge = Date.now() - lastFetch
  
  // Invalidate if cache is older than max age or if content was updated after cache
  return cacheAge > maxAge || updateTime > lastFetch
}