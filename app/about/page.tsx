import { generateMetadata as generateMeta } from '@/lib/utils'

export const metadata = generateMeta(
  'About - Noxion',
  'Learn more about Noxion, a modern blog powered by Notion and Next.js'
)

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-4xl font-bold tracking-tight">About Noxion</h1>
        
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <p className="lead">
            Noxion is a modern, fast, and beautiful blog platform that bridges the gap 
            between Notion's powerful content management capabilities and Next.js's 
            performance-focused web framework.
          </p>

          <h2>What makes Noxion special?</h2>
          
          <ul>
            <li>
              <strong>Notion-powered content:</strong> Write your posts in Notion's 
              intuitive interface with rich formatting, databases, and collaborative features.
            </li>
            <li>
              <strong>Next.js performance:</strong> Built on Next.js 14 with App Router 
              for optimal performance, SEO, and user experience.
            </li>
            <li>
              <strong>Modern design:</strong> Clean, responsive design with dark mode 
              support and beautiful typography.
            </li>
            <li>
              <strong>Developer-friendly:</strong> TypeScript, Tailwind CSS, and 
              modern development practices.
            </li>
          </ul>

          <h2>Features</h2>
          
          <ul>
            <li>📝 Write posts in Notion</li>
            <li>🎨 Beautiful, responsive design</li>
            <li>🌙 Dark mode support</li>
            <li>📱 Mobile-first approach</li>
            <li>⚡ Fast loading with ISR</li>
            <li>🔍 SEO optimized</li>
            <li>🏷️ Tag system</li>
            <li>📊 Reading time estimation</li>
            <li>🔗 Social sharing</li>
            <li>♿ Accessibility focused</li>
          </ul>

          <h2>Getting Started</h2>
          
          <p>
            To set up your own Noxion blog, you'll need:
          </p>
          
          <ol>
            <li>A Notion account with a database for your posts</li>
            <li>A Notion integration token</li>
            <li>Node.js and npm/yarn installed</li>
            <li>A deployment platform (Vercel recommended)</li>
          </ol>

          <p>
            Check out the README for detailed setup instructions and configuration options.
          </p>

          <h2>Open Source</h2>
          
          <p>
            Noxion is open source and available on GitHub. We welcome contributions, 
            bug reports, and feature requests from the community.
          </p>
        </div>
      </div>
    </div>
  )
}