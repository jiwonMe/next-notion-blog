import { notFound } from 'next/navigation'
import { getBlogBySlug, getBlogPosts, getInstalledPlugins } from '@/lib/supabase'
import { MultiTenantPluginManager, type BlogConfig } from '@noxion/core'
import { BlogCard } from '@/components/blog-card'
import { BlogHeader } from '@/components/layout/blog-header'
import { Metadata } from 'next'

interface UserBlogPostsProps {
  params: { username: string }
}

export async function generateMetadata({
  params,
}: UserBlogPostsProps): Promise<Metadata> {
  const blog = await getBlogBySlug(params.username)
  
  if (!blog) {
    return {
      title: 'Blog not found',
      description: 'The requested blog could not be found.',
    }
  }

  return {
    title: `All Posts - ${blog.title}`,
    description: `Browse all posts from ${blog.title}`,
    openGraph: {
      title: `All Posts - ${blog.title}`,
      description: `Browse all posts from ${blog.title}`,
      type: 'website',
      url: `/${blog.slug}/posts`,
    },
  }
}

export default async function UserBlogPostsPage({ params }: UserBlogPostsProps) {
  const blog = await getBlogBySlug(params.username)
  
  if (!blog) {
    notFound()
  }

  // Get blog posts
  const posts = await getBlogPosts(blog.id, true)
  
  // Get installed plugins for this blog
  const installedPlugins = await getInstalledPlugins(blog.id)
  
  // Initialize plugin manager if blog has Notion configuration
  let enhancedPosts = posts
  if (blog.notion_token && blog.notion_database_id) {
    try {
      const pluginManager = new MultiTenantPluginManager()
      
      const blogConfig: BlogConfig = {
        blogId: blog.id,
        notionToken: blog.notion_token,
        notionDatabaseId: blog.notion_database_id,
        plugins: installedPlugins.map(ip => ({
          plugin: {
            name: ip.plugins.name,
            version: ip.plugins.version,
            description: ip.plugins.description,
            author: ip.plugins.author,
            register: async () => {
              // Dynamic plugin loading would happen here
              const { default: plugin } = await import(`@noxion/plugin-${ip.plugins.name}`)
              return plugin
            },
            config: ip.settings,
          },
          enabled: ip.enabled,
          settings: ip.settings,
          installedVersion: ip.installed_version,
        })),
        settings: blog.settings || {},
      }

      await pluginManager.initializeBlog(blogConfig)
      enhancedPosts = await pluginManager.getEnhancedPosts(blog.id)
    } catch (error) {
      console.error('Failed to initialize plugin manager:', error)
      // Fallback to regular posts
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <BlogHeader blog={blog} />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            All Posts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {enhancedPosts.length} {enhancedPosts.length === 1 ? 'post' : 'posts'} published
          </p>
        </div>

        {/* Posts Grid */}
        {enhancedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enhancedPosts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                href={`/${blog.slug}/posts/${post.slug}`}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              No posts yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {blog.notion_database_id 
                ? "Posts will appear here once they're published in Notion."
                : "This blog hasn't been connected to a Notion database yet."
              }
            </p>
          </div>
        )}

        {/* Powered by Noxion */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Powered by{' '}
            <a 
              href="https://noxion.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Noxion
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}