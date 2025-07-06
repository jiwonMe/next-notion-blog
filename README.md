# Noxion 📝

A modern, fast, and beautiful blog platform powered by Notion and Next.js 14.

## Features

- 📝 **Notion-powered content**: Write your posts in Notion's intuitive interface
- ⚡ **Next.js 14 App Router**: Built with the latest Next.js features for optimal performance
- 🎨 **Beautiful design**: Clean, responsive design with dark mode support
- 🚀 **Fast loading**: Incremental Static Regeneration (ISR) for optimal performance
- 🔍 **SEO optimized**: Built-in SEO best practices
- 🏷️ **Tag system**: Organize your posts with tags
- 📊 **Reading time**: Automatic reading time estimation
- 🌙 **Dark mode**: Toggle between light and dark themes
- 📱 **Mobile-first**: Responsive design that works on all devices
- 🔧 **TypeScript**: Fully typed for better development experience

## Demo

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

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your Notion credentials
# NOTION_TOKEN=your_integration_token
# NOTION_DATABASE_ID=your_database_id

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your blog.

## Configuration

### Environment Variables

- `NOTION_TOKEN`: Your Notion integration token (required)
- `NOTION_DATABASE_ID`: Your Notion database ID (required)
- `NEXT_PUBLIC_SITE_URL`: Your site URL for SEO
- `NEXT_PUBLIC_SITE_NAME`: Your site name

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