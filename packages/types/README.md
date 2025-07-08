# @noxion/types

> Shared TypeScript types and interfaces for the Noxion blog platform ecosystem.

## Installation

```bash
npm install @noxion/types
# or
pnpm add @noxion/types
# or
yarn add @noxion/types
```

## Usage

```typescript
import type { 
  BlogPost, 
  NoxionPlugin, 
  NoxionCoreContext,
  Comment 
} from '@noxion/types'

// Use the types in your plugin or application
export function createMyPlugin(): NoxionPlugin {
  return {
    name: 'my-plugin',
    version: '1.0.0',
    register: (core: NoxionCoreContext) => {
      // Implementation
    }
  }
}
```

## Available Types

### Core Types

- `BlogPost` - Blog post data structure
- `NotionPage` - Raw Notion page response
- `NotionBlock` - Notion block data
- `ViewMode` - UI view modes ('grid' | 'list')
- `SearchResult` - Search functionality results

### Plugin System Types

- `NoxionPlugin` - Plugin interface
- `NoxionCoreContext` - Core context for plugin registration
- `NoxionConfig` - Main configuration object
- `HookName` - Available lifecycle hooks
- `HookHandler` - Hook handler function signature

### Comment System Types

- `Comment` - Comment data structure
- `CommentFormData` - Form submission data
- `CommentApiResponse` - API response format

### Utility Types

- `TableOfContentsItem` - TOC structure
- `SiteMetadata` - Site configuration
- `NoxionError` - Error handling

## Type Definitions

### BlogPost

```typescript
interface BlogPost {
  id: string
  title: string
  slug: string
  summary: string
  published: boolean
  date: string
  tags: string[]
  cover?: string
  content?: string
  lastEditedTime: string
  readingTime?: number
}
```

### NoxionPlugin

```typescript
interface NoxionPlugin {
  name: string
  version: string
  register: (core: NoxionCoreContext) => void | Promise<void>
  dependencies?: string[]
  config?: Record<string, any>
}
```

### NoxionCoreContext

```typescript
interface NoxionCoreContext {
  registerRoute: (path: string, handler: Function) => void
  registerComponent: (name: string, component: React.ComponentType) => void
  registerHook: (hookName: string, handler: Function) => void
  getConfig: () => NoxionConfig
  getPosts: () => Promise<BlogPost[]>
  getPost: (slug: string) => Promise<BlogPost | null>
}
```

## License

MIT © [Noxion Team](../../LICENSE)