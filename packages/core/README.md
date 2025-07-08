# @noxion/core

> Core functionality for the Noxion blog platform, including Notion API integration, plugin management, and content rendering.

## Installation

```bash
npm install @noxion/core @noxion/types
# or
pnpm add @noxion/core @noxion/types
# or
yarn add @noxion/core @noxion/types
```

## Quick Start

```typescript
import { createDefaultConfig, PluginManager } from '@noxion/core'

// Create configuration
const config = createDefaultConfig([
  // Add your plugins here
])

// Initialize plugin manager
const pluginManager = new PluginManager(config)
await pluginManager.initializePlugins()

// Use enhanced functions
const posts = await pluginManager.getEnhancedPosts()
const post = await pluginManager.getEnhancedPost('my-post-slug')
```

## Features

### 🔌 Plugin Management
- Plugin registration and lifecycle management
- Component and route registration
- Hook system for data transformation

### 📝 Notion Integration
- Full Notion API integration
- Automatic content fetching and caching
- Rich content parsing and validation

### 🎨 Content Rendering
- Markdown content component with syntax highlighting
- Math equation support (KaTeX)
- Auto-linking headings
- Code syntax highlighting

### 🚀 Performance
- Smart caching system
- Error handling and recovery
- Input validation and sanitization

## API Reference

### PluginManager

Main class for managing plugins and enhanced content operations.

```typescript
import { PluginManager } from '@noxion/core'

const manager = new PluginManager(config)

// Register a plugin
await manager.registerPlugin(myPlugin)

// Get enhanced content
const posts = await manager.getEnhancedPosts()
const post = await manager.getEnhancedPost(slug)

// Get registered components
const MyComponent = manager.getComponent('MyComponent')
```

### NotionClient

Direct Notion API integration.

```typescript
import { NotionClient } from '@noxion/core'

const client = new NotionClient(token, databaseId)

// Fetch posts
const posts = await client.getDatabasePages()
const post = await client.getPageBySlug(slug)
const content = await client.getPageContent(pageId)
```

### Components

#### MarkdownContent

React component for rendering rich markdown content.

```typescript
import { MarkdownContent } from '@noxion/core'

function PostContent({ content }: { content: string }) {
  return (
    <article>
      <MarkdownContent content={content} className="prose" />
    </article>
  )
}
```

### Utilities

#### Configuration Helpers

```typescript
import { createDefaultConfig, validateEnvironment } from '@noxion/core'

// Create config from environment variables
const config = createDefaultConfig(plugins)

// Validate required environment variables
const { token, databaseId } = validateEnvironment()
```

#### Error Handling

```typescript
import { 
  NotionAPIError, 
  DataValidationError, 
  safeAsync,
  logError 
} from '@noxion/core'

// Safe async operations
const result = await safeAsync(
  () => riskyOperation(),
  fallbackValue,
  'operation context'
)

// Error logging
logError(error, 'context', { additionalInfo: 'value' })
```

#### Validation

```typescript
import { 
  validateBlogPost,
  createSafeBlogPost,
  sanitizeString 
} from '@noxion/core'

// Validate data
if (validateBlogPost(data)) {
  // data is type-safe BlogPost
}

// Create safe blog post
const safePost = createSafeBlogPost(rawData)

// Sanitize input
const cleanString = sanitizeString(userInput)
```

#### Caching

```typescript
import { 
  getCachedPosts,
  getCachedPost,
  invalidatePostCache,
  CACHE_TTL 
} from '@noxion/core'

// Cache posts
const posts = await getCachedPosts(
  () => fetchPosts(),
  'cache-key',
  CACHE_TTL.POSTS
)

// Invalidate cache
invalidatePostCache(slug)
```

## Environment Variables

```bash
# Required
NOTION_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=your_notion_database_id

# Optional caching configuration
CACHE_TTL_POSTS=300        # 5 minutes
CACHE_TTL_POST=600         # 10 minutes
CACHE_TTL_CONTENT=900      # 15 minutes
```

## Plugin Development

### Creating a Plugin

```typescript
import type { NoxionPlugin } from '@noxion/types'

export function createMyPlugin(config: MyConfig): NoxionPlugin {
  return {
    name: 'my-plugin',
    version: '1.0.0',
    
    register: (core) => {
      // Register components
      core.registerComponent('MyComponent', MyComponent)
      
      // Register API routes
      core.registerRoute('/api/my-endpoint', myHandler)
      
      // Register hooks
      core.registerHook('afterPostRender', (post) => {
        // Transform post
        return { ...post, enhanced: true }
      })
    }
  }
}
```

### Available Hooks

- `beforePostRender` - Transform post before rendering
- `afterPostRender` - Enhance post after processing  
- `beforePostsQuery` - Modify posts query
- `afterPostsQuery` - Transform posts list

## TypeScript Support

Full TypeScript support with comprehensive type definitions.

```typescript
import type { 
  BlogPost, 
  NoxionPlugin, 
  NoxionCoreContext 
} from '@noxion/types'
```

## License

MIT © [Noxion Team](../../LICENSE)