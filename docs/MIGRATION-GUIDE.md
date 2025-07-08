# Migration Guide: Monorepo Refactoring

This document outlines the major changes made during the monorepo refactoring and plugin system implementation.

## 🏗️ Architecture Changes

### Before: Single Package
```
next-notion-blog/
├── components/
├── lib/
├── types/
├── pages/
└── package.json
```

### After: Monorepo with Plugin System
```
noxion/
├── packages/
│   ├── types/                    # @noxion/types
│   ├── core/                     # @noxion/core  
│   └── plugin-comments/          # @noxion/plugin-comments
├── apps/
│   └── web/                      # Next.js application
└── package.json
```

## 📦 Package Structure

### `@noxion/types`
- **Purpose**: Shared TypeScript interfaces and types
- **Exports**: `BlogPost`, `NoxionPlugin`, `NoxionConfig`, `Comment`, etc.
- **Location**: `packages/types/`

### `@noxion/core`
- **Purpose**: Core functionality, plugin management, Notion integration
- **Key Features**:
  - `PluginManager` - Central plugin orchestration
  - `NotionClient` - Notion API integration with caching
  - `MarkdownContent` - Enhanced markdown rendering component
  - Error handling and validation utilities
- **Location**: `packages/core/`

### `@noxion/plugin-comments`
- **Purpose**: Full-featured commenting system
- **Key Features**:
  - React components for comment display and forms
  - Supabase backend integration
  - Admin moderation capabilities
  - Nested replies support
- **Location**: `packages/plugin-comments/`

## 🔌 Plugin System

### Core Concepts

#### Plugin Registration
```typescript
export function createMyPlugin(config: MyPluginConfig): NoxionPlugin {
  return {
    name: 'my-plugin',
    version: '1.0.0',
    register: (core: NoxionCoreContext) => {
      // Register components, routes, hooks
    }
  }
}
```

#### Component Registration
Plugins can register React components that are dynamically loaded:

```typescript
// Server-side registration (avoids SSR issues)
core.registerComponent('MyComponent', '@my-plugin/client')

// Client-side usage
const MyComponent = getCommentsComponent()
```

#### API Route Registration
Plugins can provide API endpoints:

```typescript
core.registerRoute('GET /api/my-route', async (request, params) => {
  return NextResponse.json({ data: 'response' })
})
```

#### Lifecycle Hooks
Plugins can enhance data at various points:

```typescript
core.registerHook('afterPostRender', async (post) => {
  return { ...post, enhanced: true }
})
```

## 🚀 Migration Steps

### 1. Import Changes

**Before:**
```typescript
import { BlogPost } from '@/types/notion'
import { getDatabasePages } from '@/lib/notion'
```

**After:**
```typescript
import { BlogPost } from '@noxion/types'
import { getPosts } from '@/lib/noxion'
```

### 2. Function Usage

**Before:**
```typescript
const posts = await getDatabasePages()
const post = await getPageContent(id)
```

**After:**
```typescript
const posts = await getPosts()        // Enhanced with plugins
const post = await getPost(slug)      // Enhanced with plugins
```

### 3. Component Usage

**Before:**
```typescript
import { MarkdownContent } from '@/components/markdown-content'
```

**After:**
```typescript
import { MarkdownContent } from '@noxion/core'
// Or for plugin components:
import { ClientCommentsSection } from '@/components/comments-wrapper'
```

## 🔧 Configuration Changes

### Plugin Configuration
Create `apps/web/lib/noxion.ts`:

```typescript
import { createDefaultConfig, PluginManager } from '@noxion/core'
import { createCommentsPlugin } from '@noxion/plugin-comments'

const config = createDefaultConfig([
  createCommentsPlugin({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    autoApprove: false,
    moderationEnabled: true,
  }),
])

export const pluginManager = new PluginManager(config)
export const getPosts = () => pluginManager.getEnhancedPosts()
export const getPost = (slug: string) => pluginManager.getEnhancedPost(slug)
```

### Environment Variables
Same as before, with optional plugin-specific variables:

```bash
# Core (required)
NOTION_TOKEN=your_notion_token
NOTION_DATABASE_ID=your_database_id

# Comments Plugin (optional)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🏃 Development Workflow

### Build Commands
```bash
# Build all packages (required before web app)
pnpm build:packages

# Build web application
pnpm build:web

# Build everything
pnpm build

# Development
pnpm dev
```

### Package Development
```bash
# Build specific package
pnpm --filter=@noxion/core build

# Watch mode for package development
pnpm --filter=@noxion/core dev
```

## 🎯 Benefits

### Scalability
- **Independent packages**: Core, plugins, and types can be published and versioned separately
- **Plugin architecture**: Add new features without modifying core code
- **Build optimization**: Only rebuild changed packages

### Developer Experience
- **Type safety**: Shared types across all packages
- **Hot reload**: Package changes trigger rebuilds
- **Clear separation**: Core logic separated from application code

### Extensibility
- **Plugin ecosystem**: Easy to create and share plugins
- **Hook system**: Enhance data at any point in the pipeline
- **Component system**: Register UI components from plugins

## 🚨 Breaking Changes

1. **Import paths**: All imports now use `@noxion/*` packages
2. **Function names**: `getDatabasePages()` → `getPosts()`, `getPageContent()` → `getPost()`
3. **Configuration**: Must configure plugins in `lib/noxion.ts`
4. **Build process**: Must build packages before web application

## 🔄 Backwards Compatibility

The core functionality remains the same:
- ✅ Same Notion integration
- ✅ Same UI/UX
- ✅ Same deployment options
- ✅ Same environment variables (core)
- ✅ Enhanced with plugin capabilities

## 📚 Next Steps

1. **Create custom plugins**: Follow the plugin development guide
2. **Explore ecosystem**: Check for community plugins
3. **Contribute**: Help build the plugin ecosystem
4. **Deploy**: Use existing deployment methods with new build commands

## 🐛 Troubleshooting

### Build Issues
```bash
# Clean everything and rebuild
pnpm clean
pnpm build:packages
pnpm build:web
```

### Type Errors
```bash
# Ensure all packages are built
pnpm build:packages

# Check TypeScript
pnpm type-check
```

### Plugin Issues
- Ensure plugins are properly registered in `lib/noxion.ts`
- Check that client components use `'use client'` directive
- Verify environment variables for plugin configuration