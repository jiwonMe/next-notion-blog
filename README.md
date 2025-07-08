# Noxion - Plugin-Based Blog Platform

> A modern, scalable, and extensible blog platform powered by Notion and Next.js 14, built as a monorepo with a powerful plugin system.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Notion](https://img.shields.io/badge/Notion-000000?style=flat-square&logo=notion&logoColor=white)](https://notion.so/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)

## ✨ Features

### 🏗️ **Monorepo Architecture**
- **Independent packages**: Core, plugins, and types as publishable npm packages
- **pnpm workspaces**: Efficient dependency management and build caching
- **Turborepo**: Optimized build system with intelligent caching

### 🔌 **Plugin System**
- **Extensible architecture**: Add features through plugins without touching core code
- **React component registration**: Plugins can provide UI components
- **API route handling**: Plugins can register custom API endpoints
- **Hook system**: Lifecycle hooks for data transformation and enhancement

### 📝 **Content Management**
- **Notion integration**: Use Notion as your CMS with full API support
- **Markdown rendering**: Rich content with syntax highlighting, math, and more
- **Caching system**: Smart caching for optimal performance
- **Static generation**: Full SSG support with ISR

### 🎨 **Modern UI/UX**
- **Responsive design**: Mobile-first with Tailwind CSS
- **Dark/light themes**: Built-in theme switching
- **Loading states**: Skeleton loaders and smooth transitions
- **SEO optimized**: Meta tags, Open Graph, and structured data

## 🏃 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Notion account with API access

### 1. Clone and Install

```bash
git clone https://github.com/your-username/noxion.git
cd noxion
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp apps/web/.env.example apps/web/.env.local

# Configure your environment variables
NOTION_TOKEN=your_notion_token
NOTION_DATABASE_ID=your_database_id

# Optional: For comments plugin
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Build and Run

```bash
# Build all packages
pnpm build:packages

# Start development server
pnpm dev

# Or build for production
pnpm build
pnpm start
```

## 📦 Package Structure

```
noxion/
├── packages/                     # Independent npm packages
│   ├── types/                    # @noxion/types - Shared TypeScript types
│   ├── core/                     # @noxion/core - Core functionality
│   └── plugin-comments/          # @noxion/plugin-comments - Comments plugin
├── apps/
│   └── web/                      # Next.js blog application
├── docs/                         # Documentation
└── examples/                     # Example configurations
```

### Package Details

#### `@noxion/types`
Core TypeScript interfaces and types used across all packages.

#### `@noxion/core`
- Notion API integration with caching
- Plugin management system
- Markdown rendering components
- Error handling utilities
- Validation and sanitization

#### `@noxion/plugin-comments`
Full-featured commenting system with:
- Supabase backend integration
- Nested replies support
- Admin moderation
- Real-time updates

## 🔌 Plugin Development

### Creating a Plugin

```typescript
import { NoxionPlugin, NoxionCoreContext } from '@noxion/types'

export function createMyPlugin(config: MyPluginConfig): NoxionPlugin {
  return {
    name: 'my-plugin',
    version: '1.0.0',
    
    register: (core: NoxionCoreContext) => {
      // Register components
      core.registerComponent('MyComponent', MyComponent)
      
      // Register API routes
      core.registerRoute('GET /api/my-route', handleMyRoute)
      
      // Register hooks
      core.registerHook('afterPostRender', enhancePost)
    }
  }
}
```

### Plugin API Reference

#### Core Context Methods

- `registerComponent(name, component)` - Register React components
- `registerRoute(path, handler)` - Register API route handlers
- `registerHook(hookName, handler)` - Register lifecycle hooks
- `getConfig()` - Access global configuration
- `getPosts()` - Fetch all posts
- `getPost(slug)` - Fetch specific post

#### Available Hooks

- `beforePostRender` - Transform post before rendering
- `afterPostRender` - Enhance post after processing
- `beforePostsQuery` - Modify posts query
- `afterPostsQuery` - Transform posts list

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker

```dockerfile
FROM node:18-alpine
RUN corepack enable pnpm
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Static Export

```bash
# Build static site
pnpm build
pnpm export

# Deploy ./apps/web/out/ to any static host
```

## ⚙️ Configuration

### Plugin Configuration

```typescript
// apps/web/lib/noxion.ts
import { createDefaultConfig } from '@noxion/core'
import { createCommentsPlugin } from '@noxion/plugin-comments'

const config = createDefaultConfig([
  createCommentsPlugin({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    autoApprove: false,
    moderationEnabled: true,
  }),
  // Add more plugins here
])
```

### Site Configuration

```typescript
// apps/web/site.config.ts
export const siteConfig = {
  name: 'Your Blog',
  description: 'Your blog description',
  url: 'https://yourblog.com',
  author: {
    name: 'Your Name',
    email: 'your@email.com',
  },
  social: {
    twitter: '@yourusername',
    github: 'https://github.com/yourusername',
  },
}
```

## 🧪 Development

### Scripts

```bash
# Development
pnpm dev                  # Start dev server
pnpm build:packages      # Build all packages
pnpm build               # Build everything
pnpm type-check          # Type checking
pnpm lint                # Lint all packages
pnpm clean               # Clean all build outputs

# Publishing (maintainers only)
pnpm changeset           # Create changeset
pnpm version-packages    # Version packages
pnpm release             # Publish to npm
```

### Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## 📚 Documentation

- [Plugin Development Guide](./docs/plugin-development.md)
- [API Reference](./docs/api-reference.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT © [Noxion Team](./LICENSE)

## 🙏 Acknowledgments

- [Notion](https://notion.so/) for the amazing API
- [Next.js](https://nextjs.org/) for the fantastic framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Supabase](https://supabase.io/) for the backend infrastructure

---

<div align="center">
  <sub>Built with ❤️ by the Noxion team</sub>
</div>