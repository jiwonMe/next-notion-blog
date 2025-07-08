import { createDefaultConfig, PluginManager } from '@noxion/core'
import { createCommentsPlugin } from '@noxion/plugin-comments'

// Create the Noxion configuration
const config = createDefaultConfig([
  // Add the comments plugin if Supabase config is available
  ...(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
    ? [createCommentsPlugin({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        autoApprove: false,
        moderationEnabled: true,
      })]
    : []
  ),
])

// Create and export the plugin manager
export const pluginManager = new PluginManager(config)

// Initialize plugins
pluginManager.initializePlugins().catch(console.error)

// Export enhanced functions that use plugins
export const getPosts = () => pluginManager.getEnhancedPosts()
export const getPost = (slug: string) => pluginManager.getEnhancedPost(slug)

// Get all slugs for static generation
export const getAllSlugs = async (): Promise<string[]> => {
  const posts = await getPosts()
  return posts.map(post => post.slug)
}

// Export components for use in the app
export const getCommentsComponent = () => pluginManager.getComponent('CommentsSection')