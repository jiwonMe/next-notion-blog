import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Comment, CommentFormData, CommentApiResponse } from '@noxion/types'

export class SupabaseCommentsAPI {
  private supabase: SupabaseClient

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  /**
   * Get all comments for a specific post
   */
  async getComments(postSlug: string): Promise<CommentApiResponse> {
    try {
      const { data, error } = await this.supabase
        .from('comments')
        .select('*')
        .eq('post_slug', postSlug)
        .eq('approved', true)
        .order('created_at', { ascending: true })

      if (error) {
        return { success: false, error: error.message }
      }

      // Organize comments into a tree structure
      const comments = this.organizeComments(data || [])
      return { success: true, comments }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch comments' 
      }
    }
  }

  /**
   * Create a new comment
   */
  async createComment(commentData: CommentFormData): Promise<CommentApiResponse> {
    try {
      const { data, error } = await this.supabase
        .from('comments')
        .insert([
          {
            post_slug: commentData.postSlug,
            author: commentData.author,
            email: commentData.email,
            content: commentData.content,
            parent_id: commentData.parentId || null,
            approved: false, // Comments require approval by default
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ])
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      const comment: Comment = {
        id: data.id,
        postSlug: data.post_slug,
        author: data.author,
        email: data.email,
        content: data.content,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        approved: data.approved,
        parentId: data.parent_id,
      }

      return { success: true, comment }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create comment' 
      }
    }
  }

  /**
   * Approve a comment (admin function)
   */
  async approveComment(commentId: string): Promise<CommentApiResponse> {
    try {
      const { data, error } = await this.supabase
        .from('comments')
        .update({ approved: true, updated_at: new Date().toISOString() })
        .eq('id', commentId)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      const comment: Comment = {
        id: data.id,
        postSlug: data.post_slug,
        author: data.author,
        email: data.email,
        content: data.content,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        approved: data.approved,
        parentId: data.parent_id,
      }

      return { success: true, comment }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to approve comment' 
      }
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<CommentApiResponse> {
    try {
      const { error } = await this.supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete comment' 
      }
    }
  }

  /**
   * Organize flat comments into a tree structure
   */
  private organizeComments(comments: any[]): Comment[] {
    const commentMap = new Map<string, Comment>()
    const rootComments: Comment[] = []

    // First pass: convert to Comment objects and create map
    comments.forEach(data => {
      const comment: Comment = {
        id: data.id,
        postSlug: data.post_slug,
        author: data.author,
        email: data.email,
        content: data.content,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        approved: data.approved,
        parentId: data.parent_id,
        replies: [],
      }
      commentMap.set(comment.id, comment)
    })

    // Second pass: organize into tree structure
    commentMap.forEach(comment => {
      if (comment.parentId && commentMap.has(comment.parentId)) {
        const parent = commentMap.get(comment.parentId)!
        if (!parent.replies) parent.replies = []
        parent.replies.push(comment)
      } else {
        rootComments.push(comment)
      }
    })

    return rootComments
  }
}

/**
 * Database schema for Supabase
 */
export const COMMENTS_TABLE_SCHEMA = `
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_slug TEXT NOT NULL,
  author TEXT NOT NULL,
  email TEXT NOT NULL,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_post_slug ON comments(post_slug);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(approved);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to approved comments
CREATE POLICY "Anyone can view approved comments" ON comments
  FOR SELECT USING (approved = true);

-- Create policy for inserting new comments (public can insert, but they're not approved by default)
CREATE POLICY "Anyone can insert comments" ON comments
  FOR INSERT WITH CHECK (approved = false);
`