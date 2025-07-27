import { notFound } from 'next/navigation'
import { getBlogBySlug, getBlogPost, getInstalledPlugins } from '@/lib/supabase'
import { MultiTenantPluginManager, type BlogConfig } from '@noxion/core'
import { MarkdownContent } from '@noxion/core'
import { BlogHeader } from '@/components/layout/blog-header'
import { Metadata } from 'next'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react'

interface UserBlogPostProps {
  params: { username: string; slug: string }
}

export async function generateMetadata({
  params,
}: UserBlogPostProps): Promise<Metadata> {
  const blog = await getBlogBySlug(params.username)
  
  if (!blog) {
    return {
      title: 'Blog not found',
      description: 'The requested blog could not be found.',
    }
  }

  const post = await getBlogPost(blog.id, params.slug)
  
  if (!post) {
    return {
      title: 'Post not found',
      description: 'The requested post could not be found.',
    }
  }

  return {
    title: `${post.title} - ${blog.title}`,
    description: post.summary || `Read ${post.title} on ${blog.title}`,
    openGraph: {
      title: post.title,
      description: post.summary || `Read ${post.title} on ${blog.title}`,
      type: 'article',
      url: `/${blog.slug}/posts/${post.slug}`,
      images: post.cover_url ? [{ url: post.cover_url }] : [],
      publishedTime: post.published_at || post.created_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary || `Read ${post.title} on ${blog.title}`,
      images: post.cover_url ? [post.cover_url] : [],
    },
  }
}

export default async function UserBlogPostPage({ params }: UserBlogPostProps) {
  const blog = await getBlogBySlug(params.username)
  
  if (!blog) {
    notFound()
  }

  const post = await getBlogPost(blog.id, params.slug)
  
  if (!post) {
    notFound()
  }

  // Get installed plugins for this blog
  const installedPlugins = await getInstalledPlugins(blog.id)
  
  // Initialize plugin manager if blog has Notion configuration
  let enhancedPost = post
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
      enhancedPost = await pluginManager.getEnhancedPost(blog.id, post.slug) || post
    } catch (error) {
      console.error('Failed to initialize plugin manager:', error)
      // Fallback to regular post
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <BlogHeader blog={blog} />
      
      <div className="flex-1 container mx-auto px-4 py-8">

      {/* Post Header */}
      <article className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {enhancedPost.title}
          </h1>
          
          {/* Post Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
            {enhancedPost.published_at && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <time dateTime={enhancedPost.published_at}>
                  {format(new Date(enhancedPost.published_at), 'MMM d, yyyy')}
                </time>
              </div>
            )}
            
            {enhancedPost.readingTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{enhancedPost.readingTime} min read</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {enhancedPost.tags && enhancedPost.tags.length > 0 && (
            <div className="flex items-center gap-2 mb-8">
              <Tag className="h-4 w-4 text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {enhancedPost.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cover Image */}
          {enhancedPost.cover_url && (
            <div className="mb-8">
              <img
                src={enhancedPost.cover_url}
                alt={enhancedPost.title}
                className="w-full h-64 md:h-80 object-cover rounded-lg"
              />
            </div>
          )}
        </header>

        {/* Post Content */}
        <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
          {enhancedPost.content_md ? (
            <MarkdownContent content={enhancedPost.content_md} />
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              Content not available. Please check the Notion database connection.
            </p>
          )}
        </div>

        {/* Plugin-specific content would be rendered here */}
        {installedPlugins.map((plugin) => {
          if (!plugin.enabled) return null
          
          // This is where plugin-specific components would be rendered
          // For example, comments, analytics, etc.
          return (
            <div key={plugin.plugin_id} className="mt-8">
              {/* Plugin component would be rendered here */}
            </div>
          )
        })}
      </article>

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