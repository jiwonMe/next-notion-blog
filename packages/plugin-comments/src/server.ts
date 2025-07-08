// Server-only exports for plugin registration
export { createCommentsPlugin } from './plugin'
export { SupabaseCommentsAPI, COMMENTS_TABLE_SCHEMA } from './api/supabase'
export { CommentsAPIRoutes } from './api/routes'
export type { Comment, CommentFormData, CommentApiResponse } from '@noxion/types'