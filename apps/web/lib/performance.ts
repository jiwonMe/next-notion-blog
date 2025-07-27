import { BlogPost } from '@noxion/types'
import { preloadCache, getCacheStats, cleanupExpiredCache } from './cache'
import { logError } from './error-handling'

/**
 * Performance monitoring and optimization utilities
 */

/**
 * Performance metrics tracking
 */
interface PerformanceMetrics {
  fetchTime: number
  cacheHit: boolean
  dataSize: number
  timestamp: number
}

const performanceMetrics = new Map<string, PerformanceMetrics[]>()

/**
 * Record performance metrics
 */
export function recordMetrics(
  operation: string,
  fetchTime: number,
  cacheHit: boolean,
  dataSize: number = 0
): void {
  const metrics: PerformanceMetrics = {
    fetchTime,
    cacheHit,
    dataSize,
    timestamp: Date.now(),
  }

  if (!performanceMetrics.has(operation)) {
    performanceMetrics.set(operation, [])
  }

  const operationMetrics = performanceMetrics.get(operation)!
  operationMetrics.push(metrics)

  // Keep only last 100 metrics per operation
  if (operationMetrics.length > 100) {
    operationMetrics.shift()
  }
}

/**
 * Get performance statistics
 */
export function getPerformanceStats(operation?: string) {
  if (operation) {
    const metrics = performanceMetrics.get(operation) || []
    return calculateStats(metrics)
  }

  const allStats: Record<string, any> = {}
  performanceMetrics.forEach((metrics, op) => {
    allStats[op] = calculateStats(metrics)
  })

  return {
    operations: allStats,
    cache: getCacheStats(),
    summary: {
      totalOperations: Array.from(performanceMetrics.values()).reduce(
        (sum, metrics) => sum + metrics.length,
        0
      ),
      avgFetchTime: Array.from(performanceMetrics.values())
        .flat()
        .reduce((sum, m, _, arr) => sum + m.fetchTime / arr.length, 0),
      cacheHitRate: Array.from(performanceMetrics.values())
        .flat()
        .reduce((sum, m, _, arr) => sum + (m.cacheHit ? 1 : 0) / arr.length, 0),
    },
  }
}

function calculateStats(metrics: PerformanceMetrics[]) {
  if (metrics.length === 0) {
    return {
      count: 0,
      avgFetchTime: 0,
      minFetchTime: 0,
      maxFetchTime: 0,
      cacheHitRate: 0,
      avgDataSize: 0,
    }
  }

  const fetchTimes = metrics.map(m => m.fetchTime)
  const cacheHits = metrics.filter(m => m.cacheHit).length
  const dataSizes = metrics.map(m => m.dataSize)

  return {
    count: metrics.length,
    avgFetchTime: fetchTimes.reduce((sum, time) => sum + time, 0) / fetchTimes.length,
    minFetchTime: Math.min(...fetchTimes),
    maxFetchTime: Math.max(...fetchTimes),
    cacheHitRate: cacheHits / metrics.length,
    avgDataSize: dataSizes.reduce((sum, size) => sum + size, 0) / dataSizes.length,
  }
}

/**
 * Warm up cache with popular content
 */
export async function warmupCache(fetcher: () => Promise<BlogPost[]>): Promise<void> {
  try {
    const startTime = Date.now()
    
    // Preload content using provided fetcher
    await preloadCache(fetcher)
    
    recordMetrics('cache_warmup', Date.now() - startTime, false)
  } catch (error) {
    logError(error, 'Cache warmup failed')
  }
}

/**
 * Background job to maintain optimal performance
 */
export function startPerformanceMonitoring(): NodeJS.Timeout {
  return setInterval(async () => {
    try {
      // Cleanup expired cache
      cleanupExpiredCache()
      
      // Log performance stats in development
      if (process.env.NODE_ENV === 'development') {
        const stats = getPerformanceStats()
        if ('cache' in stats && 'summary' in stats) {
          console.log('📊 Performance Stats:', {
            cacheStats: stats.cache,
            summary: stats.summary,
          })
        }
      }
    } catch (error) {
      logError(error, 'Performance monitoring')
    }
  }, 60000) // Run every minute
}

/**
 * Optimize data fetching with parallel loading
 */
export async function optimizedDataFetch<T>(
  operations: Array<() => Promise<T>>,
  maxConcurrency: number = 3
): Promise<T[]> {
  const results: T[] = []
  const errors: Error[] = []

  // Process operations in batches to avoid overwhelming the API
  for (let i = 0; i < operations.length; i += maxConcurrency) {
    const batch = operations.slice(i, i + maxConcurrency)
    const startTime = Date.now()

    try {
      const batchResults = await Promise.allSettled(
        batch.map(operation => operation())
      )

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          errors.push(result.reason)
          logError(result.reason, `Batch operation ${i + index}`)
        }
      })

      recordMetrics('batch_fetch', Date.now() - startTime, false, batch.length)
    } catch (error) {
      logError(error, 'Batch fetch error')
      errors.push(error as Error)
    }

    // Add small delay between batches to be nice to the API
    if (i + maxConcurrency < operations.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return results
}

/**
 * Preload critical content for better perceived performance
 */
export async function preloadCriticalContent<T>(
  operations: Array<() => Promise<T>>,
  priorityCount: number = 5
): Promise<void> {
  try {
    const startTime = Date.now()
    
    // Limit to priority count
    const priorityOperations = operations.slice(0, priorityCount)

    await optimizedDataFetch(priorityOperations, 2)
    
    recordMetrics('preload_content', Date.now() - startTime, false, priorityCount)
  } catch (error) {
    logError(error, 'Preload critical content failed')
  }
}

/**
 * Smart cache strategy based on access patterns
 */
export class SmartCacheStrategy {
  private accessCounts = new Map<string, number>()
  private lastAccess = new Map<string, number>()

  recordAccess(key: string): void {
    const count = this.accessCounts.get(key) || 0
    this.accessCounts.set(key, count + 1)
    this.lastAccess.set(key, Date.now())
  }

  getPopularKeys(limit: number = 10): string[] {
    return Array.from(this.accessCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([key]) => key)
  }

  getRecentKeys(limit: number = 10): string[] {
    return Array.from(this.lastAccess.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([key]) => key)
  }

  shouldPriorityCache(key: string): boolean {
    const accessCount = this.accessCounts.get(key) || 0
    const lastAccessTime = this.lastAccess.get(key) || 0
    const timeSinceAccess = Date.now() - lastAccessTime
    
    // Priority cache if accessed more than 3 times or accessed recently
    return accessCount > 3 || timeSinceAccess < 300000 // 5 minutes
  }
}

// Global smart cache instance
export const smartCache = new SmartCacheStrategy()

/**
 * Performance-aware wrapper for data fetching
 */
export async function performanceAwareFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    enableMetrics?: boolean
    recordAccess?: boolean
  } = {}
): Promise<T> {
  const { enableMetrics = true, recordAccess = true } = options
  const startTime = Date.now()

  try {
    if (recordAccess) {
      smartCache.recordAccess(key)
    }

    const result = await fetcher()
    
    if (enableMetrics) {
      const fetchTime = Date.now() - startTime
      recordMetrics(key, fetchTime, false, JSON.stringify(result).length)
    }

    return result
  } catch (error) {
    if (enableMetrics) {
      recordMetrics(key, Date.now() - startTime, false, 0)
    }
    throw error
  }
}

/**
 * Get performance recommendations
 */
export function getPerformanceRecommendations() {
  const stats = getPerformanceStats()
  const recommendations: string[] = []

  // Check if stats has summary and cache properties (full stats)
  if ('summary' in stats && 'cache' in stats) {
    // Check cache hit rate
    if (stats.summary.cacheHitRate < 0.7) {
      recommendations.push('Consider increasing cache TTL or improving cache strategy')
    }

    // Check average fetch time
    if (stats.summary.avgFetchTime > 1000) {
      recommendations.push('API response times are slow, consider optimization')
    }

    // Check cache size
    if (stats.cache.total > 1000) {
      recommendations.push('Cache size is large, consider implementing LRU eviction')
    }
  }

  return recommendations
}