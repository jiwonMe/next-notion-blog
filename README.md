# Noxion 📝

A modern, fast, and beautiful blog platform powered by Notion and Next.js 14. Transform your Notion pages into a stunning blog with zero coding required.

## ✨ Features

- 📝 **Notion-powered content**: Write your posts in Notion's intuitive interface
- ⚡ **Next.js 14 App Router**: Built with the latest Next.js features for optimal performance
- 🎨 **Beautiful design**: Clean, responsive design with dark mode support using Tailwind CSS
- 🚀 **Fast loading**: Incremental Static Regeneration (ISR) for optimal performance
- 🔍 **SEO optimized**: Built-in SEO best practices with meta tags and Open Graph
- 🏷️ **Tag system**: Organize your posts with tags and categories
- 📊 **Reading time**: Automatic reading time estimation
- 🌙 **Dark mode**: Toggle between light and dark themes with next-themes
- 📱 **Mobile-first**: Responsive design that works on all devices
- 🔧 **TypeScript**: Fully typed for better development experience
- 🖼️ **Image optimization**: Automatic image optimization and cover image support
- 📝 **Markdown support**: Rich content rendering with syntax highlighting
- 🎯 **Math equations**: KaTeX support for mathematical expressions
- 🔗 **Auto-linking**: Automatic heading anchors and table of contents

## 🚀 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Content**: Notion API + notion-to-md
- **Typography**: @tailwindcss/typography
- **Icons**: Lucide React + Radix Icons
- **Theme**: next-themes for dark mode
- **Math**: KaTeX for equations
- **Code**: highlight.js for syntax highlighting
- **Date**: date-fns for date formatting

## 📦 Project Structure

```
next-notion-blog/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx          # Homepage with hero and blog posts
│   ├── globals.css       # Global styles and CSS variables
│   ├── about/            # About page
│   ├── posts/[slug]/     # Dynamic blog post pages
│   ├── manifest.ts       # PWA manifest
│   ├── robots.ts         # Robots.txt generation
│   └── sitemap.ts        # Sitemap generation
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   ├── blog-card.tsx     # Blog post card component
│   ├── header.tsx        # Site navigation header
│   ├── footer.tsx        # Site footer
│   ├── theme-provider.tsx # Theme context provider
│   ├── theme-toggle.tsx  # Dark mode toggle
│   └── markdown-content.tsx # Markdown renderer
├── lib/                  # Utility functions and API
│   ├── notion.ts         # Notion API integration
│   └── utils.ts          # Utility functions
├── types/                # TypeScript type definitions
│   └── notion.ts         # Notion-specific types
└── Configuration files
    ├── next.config.js    # Next.js configuration
    ├── tailwind.config.js # Tailwind CSS configuration
    ├── tsconfig.json     # TypeScript configuration
    └── components.json   # shadcn/ui configuration
```

## 🎯 Demo

Check out a live demo at [your-demo-url.com](https://your-demo-url.com)

## Quick Start

### 1. Setup Notion Database

Create a new Notion database with the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| Title | Title | ✅ | Post title |
| Slug | Rich Text | ❌ | URL slug (auto-generated if empty) |
| Summary | Rich Text | ❌ | Post summary/excerpt |
| Published | Checkbox | ✅ | Whether the post is published |
| Date | Date | ✅ | Publication date |
| Tags | Multi-select | ❌ | Post tags/categories |

### 2. Create Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Name your integration (e.g., "Noxion Blog")
4. Select your workspace
5. Copy the integration token

### 3. Share Database with Integration

1. Open your Notion database
2. Click "Share" in the top right
3. Click "Invite" and select your integration
4. Copy the database ID from the URL

### 4. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/noxion)

1. Click the deploy button above
2. Fork the repository
3. Add environment variables in Vercel dashboard:
   - `NOTION_TOKEN`: Your integration token
   - `NOTION_DATABASE_ID`: Your database ID

### 5. Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/noxion.git
cd noxion

# Install dependencies (using pnpm for faster installs)
pnpm install
# or
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your Notion credentials
# NOTION_TOKEN=your_integration_token
# NOTION_DATABASE_ID=your_database_id

# Run the development server
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your blog.

## 📜 Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript type checking
```

## Configuration

### Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
# Required - Notion Configuration
NOTION_TOKEN=your_notion_integration_token_here
NOTION_DATABASE_ID=your_notion_database_id_here

# Optional - Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME=Noxion

# Optional - Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id_here
```

**Required Variables:**
- `NOTION_TOKEN`: Your Notion integration token
- `NOTION_DATABASE_ID`: Your Notion database ID

**Optional Variables:**
- `NEXT_PUBLIC_SITE_URL`: Your site URL for SEO and Open Graph
- `NEXT_PUBLIC_SITE_NAME`: Your site name for branding
- `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`: Google Analytics tracking ID

### Customization

#### Site Information
Edit `app/layout.tsx` to customize:
- Site title and description
- Open Graph metadata
- Twitter card metadata

#### Styling
The project uses Tailwind CSS. You can customize:
- `tailwind.config.js`: Extend the theme
- `app/globals.css`: Global styles and CSS variables
- Component styles in individual files

#### Notion Database Schema
The default schema works with these property names:
- `Title` or `Name`: Post title
- `Slug`: URL slug (optional)
- `Summary` or `Description`: Post excerpt
- `Published`: Publication status
- `Date` or `Created`: Publication date
- `Tags` or `Category`: Post tags

You can modify the property names in `lib/notion.ts`.

## Database Schema Example

Your Notion database should look like this:

| Title | Slug | Summary | Published | Date | Tags |
|-------|------|---------|-----------|------|------|
| My First Post | my-first-post | This is my first blog post | ✅ | 2024-01-01 | Tech, Tutorial |
| Another Post | | A post without a custom slug | ✅ | 2024-01-02 | Personal |

## Performance

- **ISR**: Pages are statically generated and revalidated every hour
- **Image optimization**: Next.js automatic image optimization
- **Code splitting**: Automatic code splitting for optimal loading
- **SEO**: Built-in SEO optimization with meta tags and structured data

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please:
- Check the [documentation](https://github.com/your-username/noxion/wiki)
- Open an [issue](https://github.com/your-username/noxion/issues)
- Join our [Discord community](https://discord.gg/your-invite)

## Acknowledgments

- [Notion](https://notion.so) for the amazing API
- [Next.js](https://nextjs.org) for the fantastic framework
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [Vercel](https://vercel.com) for the deployment platform

---

Made with ❤️ by the Noxion team