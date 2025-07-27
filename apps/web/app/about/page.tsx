export const metadata = {
  title: 'About Noxion',
  description: 'Learn about Noxion, a modern multi-tenant blog platform powered by Notion and Next.js.',
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-4xl font-bold tracking-tight">About Noxion</h1>
        
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <p className="lead">
            Noxion is a multi-tenant blog platform that transforms your Notion workspace 
            into a beautiful, high-performance blog. Each user gets their own isolated 
            blog with custom domains, plugins, and complete editorial control.
          </p>

          <h2>What makes Noxion special?</h2>
          
          <ul>
            <li>
              <strong>Multi-tenant architecture:</strong> Each user gets their own blog 
              with isolated data, custom domains, and independent configuration.
            </li>
            <li>
              <strong>Notion integration:</strong> Connect your Notion database to 
              automatically sync content with beautiful formatting and rich media.
            </li>
            <li>
              <strong>Plugin ecosystem:</strong> Extend your blog with analytics, 
              comments, SEO tools, and more. Enable only what you need.
            </li>
            <li>
              <strong>Next.js performance:</strong> Built on Next.js 14 with optimal 
              performance, SEO, and user experience.
            </li>
          </ul>

          <h2>Features</h2>
          
          <ul>
            <li>🏢 Multi-tenant SaaS architecture</li>
            <li>📝 Write posts in Notion</li>
            <li>🔌 Extensible plugin system</li>
            <li>🌐 Custom domain support</li>
            <li>📊 Built-in analytics</li>
            <li>💬 Comment system</li>
            <li>🔍 SEO optimization</li>
            <li>🎨 Beautiful, responsive design</li>
            <li>🌙 Dark mode support</li>
            <li>⚡ Lightning fast performance</li>
          </ul>

          <h2>Getting Started</h2>
          
          <p>
            Creating your blog is simple:
          </p>
          
          <ol>
            <li>Sign up with your preferred OAuth provider</li>
            <li>Create your blog and choose a unique URL</li>
            <li>Connect your Notion database</li>
            <li>Install plugins to customize your blog</li>
            <li>Start writing and publishing!</li>
          </ol>

          <p>
            Your blog will be available at yourusername.noxion.dev, or you can 
            configure a custom domain in your dashboard.
          </p>

          <h2>Built for Scale</h2>
          
          <p>
            Noxion is designed to handle thousands of blogs with enterprise-grade 
            security, performance, and reliability. Each blog is completely isolated 
            with its own data, settings, and customizations.
          </p>
        </div>
      </div>
    </div>
  )
}