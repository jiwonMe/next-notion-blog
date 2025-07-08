import { NoxionPlugin, NoxionCoreContext } from '@noxion/types'
import { CommentsAPIRoutes } from './api/routes'

interface CommentsPluginConfig {
  supabaseUrl: string
  supabaseKey: string
  autoApprove?: boolean
  moderationEnabled?: boolean
}

export function createCommentsPlugin(config: CommentsPluginConfig): NoxionPlugin {
  return {
    name: 'comments',
    version: '1.0.0',
    config,
    
    register: (core: NoxionCoreContext) => {
      // Register the comments component with import path for dynamic loading
      core.registerComponent('CommentsSection', '@noxion/plugin-comments/client' as any)
      
      // Register API routes
      const apiRoutes = new CommentsAPIRoutes(config.supabaseUrl, config.supabaseKey)
      
      // GET /api/comments/[slug] - Get comments for a post
      core.registerRoute('GET /api/comments/:slug', async (request: any, params: any) => {
        return apiRoutes.handleGetComments(request, params.slug)
      })
      
      // POST /api/comments/[slug] - Create a new comment
      core.registerRoute('POST /api/comments/:slug', async (request: any, params: any) => {
        return apiRoutes.handleCreateComment(request, params.slug)
      })
      
      // PUT /api/comments/approve/[id] - Approve a comment (admin only)
      core.registerRoute('PUT /api/comments/approve/:id', async (request: any, params: any) => {
        return apiRoutes.handleApproveComment(request, params.id)
      })
      
      // DELETE /api/comments/[id] - Delete a comment (admin only)
      core.registerRoute('DELETE /api/comments/:id', async (request: any, params: any) => {
        return apiRoutes.handleDeleteComment(request, params.id)
      })
      
      // Register hooks for comment integration
      core.registerHook('afterPostRender', async (post: any) => {
        // Add comment count to post metadata
        const apiInstance = new CommentsAPIRoutes(config.supabaseUrl, config.supabaseKey)
        // This would require additional API method to get comment count
        // const commentCount = await apiInstance.getCommentCount(post.slug)
        return {
          ...post,
          // commentCount
        }
      })
      
      console.log('Comments plugin registered successfully')
    }
  }
}