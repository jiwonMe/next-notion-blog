import { NextRequest, NextResponse } from 'next/server'
import { SupabaseCommentsAPI } from './supabase'
import { CommentFormData } from '@noxion/types'

export class CommentsAPIRoutes {
  private api: SupabaseCommentsAPI

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.api = new SupabaseCommentsAPI(supabaseUrl, supabaseKey)
  }

  /**
   * GET /api/comments/[slug] - Get comments for a post
   */
  async handleGetComments(request: NextRequest, slug: string) {
    try {
      const response = await this.api.getComments(slug)
      
      if (response.success) {
        return NextResponse.json({
          success: true,
          comments: response.comments,
        })
      } else {
        return NextResponse.json({
          success: false,
          error: response.error,
        }, { status: 400 })
      }
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Internal server error',
      }, { status: 500 })
    }
  }

  /**
   * POST /api/comments/[slug] - Create a new comment
   */
  async handleCreateComment(request: NextRequest, slug: string) {
    try {
      const body = await request.json()
      const commentData: CommentFormData = {
        postSlug: slug,
        author: body.author,
        email: body.email,
        content: body.content,
        parentId: body.parentId,
      }

      // Basic validation
      if (!commentData.author?.trim() || !commentData.email?.trim() || !commentData.content?.trim()) {
        return NextResponse.json({
          success: false,
          error: 'All fields are required',
        }, { status: 400 })
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(commentData.email)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid email address',
        }, { status: 400 })
      }

      const response = await this.api.createComment(commentData)
      
      if (response.success) {
        return NextResponse.json({
          success: true,
          comment: response.comment,
          message: 'Comment submitted successfully! It will appear after approval.',
        })
      } else {
        return NextResponse.json({
          success: false,
          error: response.error,
        }, { status: 400 })
      }
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Internal server error',
      }, { status: 500 })
    }
  }

  /**
   * PUT /api/comments/approve/[id] - Approve a comment (admin only)
   */
  async handleApproveComment(request: NextRequest, commentId: string) {
    try {
      // TODO: Add admin authentication check here
      // const isAdmin = await checkAdminAuth(request)
      // if (!isAdmin) {
      //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      // }

      const response = await this.api.approveComment(commentId)
      
      if (response.success) {
        return NextResponse.json({
          success: true,
          comment: response.comment,
        })
      } else {
        return NextResponse.json({
          success: false,
          error: response.error,
        }, { status: 400 })
      }
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Internal server error',
      }, { status: 500 })
    }
  }

  /**
   * DELETE /api/comments/[id] - Delete a comment (admin only)
   */
  async handleDeleteComment(request: NextRequest, commentId: string) {
    try {
      // TODO: Add admin authentication check here
      // const isAdmin = await checkAdminAuth(request)
      // if (!isAdmin) {
      //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      // }

      const response = await this.api.deleteComment(commentId)
      
      if (response.success) {
        return NextResponse.json({
          success: true,
          message: 'Comment deleted successfully',
        })
      } else {
        return NextResponse.json({
          success: false,
          error: response.error,
        }, { status: 400 })
      }
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Internal server error',
      }, { status: 500 })
    }
  }
}