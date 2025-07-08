# Changelog

All notable changes to this project will be documented in this file following the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) convention.

## [Unreleased]

## [2.0.0] - 2025-07-08

### 🚀 Major Features

#### Monorepo Architecture
- **Complete refactoring** into pnpm workspace monorepo structure
- **Independent packages**: `@noxion/types`, `@noxion/core`, `@noxion/plugin-comments`
- **Build optimization** with package-level caching and incremental builds
- **Scalable development** workflow with clear package boundaries

#### Plugin System
- **Extensible architecture** for adding features without core modifications
- **Component registration** system for dynamic React component loading
- **API route registration** allowing plugins to provide custom endpoints
- **Lifecycle hooks** for data transformation and enhancement
- **Client/server separation** with proper Next.js 14 App Router support

#### Comments Plugin
- **Complete commenting system** with Supabase backend integration
- **Nested replies** with configurable depth limits
- **Admin moderation** with approval workflow
- **Real-time updates** and optimistic UI
- **Rich text support** with proper styling and formatting
- **Copy-to-clipboard** functionality for code blocks

### 🏗️ Architecture Changes

#### Package Structure
```
packages/
├── types/           # Shared TypeScript interfaces
├── core/            # Plugin manager, Notion client, utilities  
└── plugin-comments/ # Full-featured commenting system
```

#### Plugin Manager
- Central orchestration of all plugins
- Enhanced data fetching with plugin hooks
- Component registry for dynamic loading
- Route registry for API endpoints

#### Enhanced Notion Integration
- Improved caching and error handling
- Plugin-enhanced post processing
- Better type safety and validation
- Performance optimizations

### 🔧 Technical Improvements

#### Build System
- **tsup** for fast TypeScript compilation
- **ESM/CommonJS** dual package exports
- **Tree-shaking** support for optimal bundle sizes
- **Source maps** for better debugging

#### Type Safety
- Comprehensive TypeScript interfaces
- Shared types across all packages  
- Plugin API type definitions
- Enhanced error handling types

#### Developer Experience
- Hot reload for package development
- Clear separation of concerns
- Improved debugging and logging
- Better error messages

### 📦 New Packages

#### `@noxion/types` v0.1.0
- Core TypeScript interfaces and types
- Plugin system type definitions
- Notion API response types
- Comment system interfaces

#### `@noxion/core` v0.1.0
- Plugin management system
- Enhanced Notion API client
- Markdown rendering components
- Error handling and validation utilities
- Caching and performance tools

#### `@noxion/plugin-comments` v0.1.0
- React components for comment display
- Supabase backend integration
- Admin moderation interface
- API routes for comment operations
- Real-time comment loading

### 🔄 Migration

#### Breaking Changes
- **Import paths**: All imports now use `@noxion/*` packages
- **Function names**: `getDatabasePages()` → `getPosts()`, `getPageContent()` → `getPost()`
- **Build process**: Must build packages before web application
- **Configuration**: Plugin configuration required in `lib/noxion.ts`

#### Migration Guide
- Complete migration documentation in `docs/MIGRATION-GUIDE.md`
- Automated import path updates
- Backwards compatible core functionality
- Same deployment and environment setup

### ✨ Enhanced Features

#### Performance
- **Smart caching** with plugin-aware invalidation
- **Incremental builds** for faster development
- **Bundle optimization** with tree-shaking
- **Memory management** improvements

#### Extensibility
- **Plugin hooks** for data transformation
- **Component system** for UI extensions
- **API route system** for backend functionality
- **Configuration management** for plugin settings

#### Developer Tools
- **Enhanced logging** with context information
- **Better error handling** with detailed stack traces
- **Type checking** across all packages
- **Development scripts** for common tasks

### 🐛 Bug Fixes
- Fixed Next.js 14 App Router client component issues
- Resolved TypeScript compilation errors
- Fixed build dependency resolution
- Corrected import path mappings

### 📚 Documentation
- Comprehensive README updates
- Migration guide for existing projects
- Plugin development documentation
- API reference documentation
- Deployment guide updates

### 🙏 Notes
This release represents a complete architectural overhaul while maintaining backwards compatibility for core functionality. The new plugin system enables unlimited extensibility while the monorepo structure provides better scalability and maintainability.

### Added
- Open source metadata and GitHub issue/PR templates.
- Initial CI workflow for linting and building.
- Placeholders for community guidelines and security policy.

## [1.0.0] - 2025-07-07

### Added
- Initial public release.
- Created CODE_OF_CONDUCT.md, SECURITY.md, CHANGELOG.md, .env.example.
- Integrated ESLint and TypeScript checks in CI.
- Set up GitHub Actions workflow for build and test. 