import { NoxionConfig, NoxionPlugin } from '@noxion/types'

/**
 * Create a Noxion configuration object
 */
export function createNoxionConfig(config: {
  notion: {
    token: string
    databaseId: string
  }
  plugins?: NoxionPlugin[]
  cache?: {
    ttl?: number
    enabled?: boolean
  }
}): NoxionConfig {
  return {
    notion: config.notion,
    plugins: config.plugins || [],
    cache: {
      ttl: config.cache?.ttl || 300,
      enabled: config.cache?.enabled ?? true,
    },
  }
}

/**
 * Validate environment variables for Noxion
 */
export function validateEnvironment(): {
  token: string
  databaseId: string
} {
  // Only validate on server side
  if (typeof window !== 'undefined') {
    // Return empty values for client side
    return { token: '', databaseId: '' }
  }

  const token = process.env.NOTION_TOKEN
  const databaseId = process.env.NOTION_DATABASE_ID

  if (!token) {
    throw new Error('NOTION_TOKEN environment variable is required')
  }

  if (!databaseId) {
    throw new Error('NOTION_DATABASE_ID environment variable is required')
  }

  return { token, databaseId }
}

/**
 * Create a default Noxion configuration from environment variables
 */
export function createDefaultConfig(plugins: NoxionPlugin[] = []): NoxionConfig {
  const { token, databaseId } = validateEnvironment()
  
  return createNoxionConfig({
    notion: {
      token,
      databaseId,
    },
    plugins,
  })
}