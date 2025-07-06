# Noxion Documentation

## Architecture Overview

Noxion is a modern blog platform that transforms Notion pages into a beautiful, fast website using Next.js 14. The architecture consists of several key components:

### Core Components

#### 1. Notion Integration (`lib/notion.ts`)

The Notion integration handles all communication with the Notion API:

```typescript
// Key functions:
getDatabasePages()     // Fetch all published blog posts
getPageContent()       // Convert Notion page to markdown
getPageBySlug()        // Get specific post by slug
getAllSlugs()          // Get all post slugs for static generation
```

**Features:**
- Automatic slug generation from titles
- Flexible property name matching (Title/Name, Tags/Category, etc.)
- Cover image extraction from Notion pages
- Reading time calculation
- Published post filtering

#### 2. Type Definitions (`types/notion.ts`)

Comprehensive TypeScript types for Notion API responses:

```typescript
BlogPost              // Main blog post interface
NotionPage           // Raw Notion page structure
NotionPageProperty   // Individual page properties
NotionDatabaseQueryResponse // Database query results
```

#### 3. UI Components (`components/`)

Reusable React components built with shadcn/ui:

- **Blog Card** (`blog-card.tsx`): Post preview cards with cover images, tags, reading time
- **Header** (`header.tsx`): Site navigation with theme toggle
- **Footer** (`footer.tsx`): Site footer with links
- **Theme Provider** (`theme-provider.tsx`): Dark mode context
- **Markdown Content** (`markdown-content.tsx`): Rich content rendering

#### 4. App Router Structure (`app/`)

Next.js 14 App Router setup:

```
app/
├── layout.tsx          # Root layout with metadata and providers
├── page.tsx           # Homepage with hero section and blog list
├── globals.css        # Global styles and CSS custom properties
├── about/page.tsx     # About page
├── posts/[slug]/page.tsx # Dynamic blog post pages
├── manifest.ts        # PWA manifest generation
├── robots.ts          # SEO robots.txt
└── sitemap.ts         # SEO sitemap generation
```

## API Reference

### Notion Integration Functions

#### `getDatabasePages(): Promise<BlogPost[]>`

Fetches all published blog posts from the Notion database.

**Filters:**
- Only posts with `Published: true`
- Sorted by date (descending)

**Returns:** Array of `BlogPost` objects with metadata

#### `getPageContent(pageId: string): Promise<string>`

Converts a Notion page to markdown using notion-to-md.

**Parameters:**
- `pageId`: Notion page ID

**Returns:** Markdown string content

#### `getPageBySlug(slug: string): Promise<BlogPost | null>`

Retrieves a specific blog post by its slug.

**Fallback behavior:**
1. First tries to match exact slug from database
2. Falls back to auto-generated slug from title
3. Returns null if not found

**Returns:** Complete `BlogPost` with content and reading time

#### `getAllSlugs(): Promise<string[]>`

Gets all available post slugs for static site generation.

**Returns:** Array of slug strings

### Notion Database Schema

The system works with flexible property names but expects these types:

| Property | Type | Required | Alternative Names |
|----------|------|----------|-------------------|
| Title | Title | ✅ | Name |
| Slug | Rich Text | ❌ | - |
| Summary | Rich Text | ❌ | Description |
| Published | Checkbox | ✅ | - |
| Date | Date | ✅ | Created |
| Tags | Multi-select | ❌ | Category |

### Content Processing

#### Markdown Rendering

The system uses several plugins for rich content:

```typescript
// Remark plugins (markdown processing)
remark-gfm           // GitHub Flavored Markdown
remark-math          // Math equation support

// Rehype plugins (HTML processing)
rehype-slug          // Heading anchors
rehype-autolink-headings // Clickable headings
rehype-highlight     // Syntax highlighting
rehype-katex         // Math rendering
```

#### Reading Time Calculation

Automatic reading time estimation based on:
- Average reading speed: 200 words per minute
- Word count from content
- Rounded up to nearest minute

## Configuration

### Environment Variables

```bash
# Required
NOTION_TOKEN=secret_...          # Notion integration token
NOTION_DATABASE_ID=123abc...     # Notion database ID

# Optional
NEXT_PUBLIC_SITE_URL=https://...  # Site URL for SEO
NEXT_PUBLIC_SITE_NAME=MyBlog     # Site name
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=GA_... # Analytics ID
```

### Next.js Configuration (`next.config.js`)

```javascript
const nextConfig = {
  images: {
    domains: [
      'www.notion.so',
      'images.unsplash.com',
      's3.us-west-2.amazonaws.com'
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ['@notionhq/client']
  }
}
```

### Tailwind Configuration (`tailwind.config.js`)

Extended with:
- Custom colors and CSS variables
- Typography plugin for rich content
- Custom animations and utilities
- Dark mode support

## Performance Optimizations

### Static Generation & ISR

```typescript
// Page-level ISR (revalidate every hour)
export const revalidate = 3600

// Static params generation for posts
export async function generateStaticParams() {
  const slugs = await getAllSlugs()
  return slugs.map(slug => ({ slug }))
}
```

### Image Optimization

- Next.js automatic image optimization
- Notion image domains whitelisted
- Responsive images with proper sizing

### Code Splitting

- Automatic route-based code splitting
- Component-level lazy loading with Suspense
- Loading skeletons for better UX

## SEO Features

### Metadata Generation

```typescript
// Dynamic metadata for blog posts
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPageBySlug(params.slug)
  
  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      images: post.cover ? [post.cover] : undefined,
    }
  }
}
```

### Structured Data

- JSON-LD structured data for blog posts
- Rich snippets support
- Search engine optimization

### Automatic Generation

- `robots.txt` generation
- `sitemap.xml` with all posts
- PWA manifest for mobile installation

## Deployment

### Vercel (Recommended)

1. Connect GitHub repository
2. Set environment variables in dashboard
3. Automatic deployments on push

### Other Platforms

Compatible with any Node.js hosting:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Troubleshooting

### Common Issues

1. **Notion API Errors**
   - Check token validity
   - Verify database permissions
   - Ensure integration has access

2. **Missing Posts**
   - Confirm `Published` checkbox is checked
   - Verify database schema matches expected properties
   - Check for required fields (Title, Published, Date)

3. **Styling Issues**
   - Clear browser cache
   - Check Tailwind CSS build
   - Verify CSS custom properties

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=notion:*
```

This will log all Notion API requests and responses.

## Contributing

### Development Setup

1. Fork and clone repository
2. Install dependencies: `pnpm install`
3. Copy `.env.example` to `.env.local`
4. Add your Notion credentials
5. Run development server: `pnpm dev`

### Code Style

- TypeScript for type safety
- ESLint + Prettier for code formatting
- Conventional commit messages
- Component-first architecture

### Testing

```bash
pnpm lint         # ESLint checking
pnpm type-check   # TypeScript validation
pnpm build        # Production build test
```

## License

MIT License - see LICENSE file for details.