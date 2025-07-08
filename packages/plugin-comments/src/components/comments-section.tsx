'use client'

import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Comment, CommentFormData } from '@noxion/types'
import { SupabaseCommentsAPI } from '../api/supabase'
import { toast } from 'sonner'

interface CommentsSectionProps {
  postSlug: string
  supabaseUrl: string
  supabaseKey: string
  className?: string
}

interface CommentItemProps {
  comment: Comment
  onReply: (parentId: string) => void
  depth?: number
}

function CommentItem({ comment, onReply, depth = 0 }: CommentItemProps) {
  const maxDepth = 3
  const canReply = depth < maxDepth

  return (
    <div className={`${depth > 0 ? 'ml-6 mt-4' : 'mt-6'} border-l-2 ${depth > 0 ? 'border-gray-200 dark:border-gray-700 pl-4' : 'border-transparent'}`}>
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {comment.author.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                {comment.author}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(comment.createdAt), 'MMM d, yyyy \'at\' h:mm a')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
          {comment.content}
        </div>
        
        {canReply && (
          <button
            onClick={() => onReply(comment.id)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Reply
          </button>
        )}
      </div>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CommentFormProps {
  onSubmit: (data: CommentFormData) => Promise<void>
  onCancel?: () => void
  parentId?: string
  postSlug: string
  isSubmitting: boolean
}

function CommentForm({ onSubmit, onCancel, parentId, postSlug, isSubmitting }: CommentFormProps) {
  const [author, setAuthor] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!author.trim() || !email.trim() || !content.trim()) {
      return
    }

    await onSubmit({
      author: author.trim(),
      email: email.trim(),
      content: content.trim(),
      postSlug,
      parentId,
    })

    // Reset form
    setAuthor('')
    setEmail('')
    setContent('')
    if (onCancel) onCancel()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name *
          </label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Comment *
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          placeholder="Share your thoughts..."
          disabled={isSubmitting}
        />
      </div>
      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={isSubmitting || !author.trim() || !email.trim() || !content.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : parentId ? 'Reply' : 'Post Comment'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export function CommentsSection({ postSlug, supabaseUrl, supabaseKey, className = '' }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [api] = useState(() => new SupabaseCommentsAPI(supabaseUrl, supabaseKey))

  useEffect(() => {
    loadComments()
  }, [postSlug])

  const loadComments = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.getComments(postSlug)
      if (response.success && response.comments) {
        setComments(response.comments)
      } else {
        setError(response.error || 'Failed to load comments')
        toast.error('Failed to load comments', {
          description: response.error || 'Please try refreshing the page'
        })
      }
    } catch (err) {
      setError('Failed to load comments')
      toast.error('Failed to load comments', {
        description: 'Network error occurred while loading comments'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (data: CommentFormData) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await api.createComment(data)
      if (response.success) {
        // Show success toast
        if (data.parentId) {
          toast.success('Reply submitted successfully!', {
            description: 'Your reply will appear after approval'
          })
        } else {
          toast.success('Comment submitted successfully!', {
            description: 'Your comment will appear after approval'
          })
        }
        
        // Clear any reply state
        setReplyingTo(null)
        
        // Optionally reload comments to show the new comment if it's auto-approved
        await loadComments()
      } else {
        setError(response.error || 'Failed to submit comment')
        toast.error('Failed to submit comment', {
          description: response.error || 'Please check your input and try again'
        })
      }
    } catch (err) {
      setError('Failed to submit comment')
      toast.error('Failed to submit comment', {
        description: 'Network error occurred while submitting'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReply = (parentId: string) => {
    setReplyingTo(replyingTo === parentId ? null : parentId)
  }

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-300 rounded"></div>
            <div className="h-20 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Comments ({comments.length})
        </h3>

        {error && (
          <div className={`mb-6 p-4 rounded-md ${error.includes('successfully') 
            ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700' 
            : 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
          }`}>
            {error}
          </div>
        )}

        {/* Comment Form */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Leave a Comment
          </h4>
          <CommentForm
            onSubmit={handleSubmitComment}
            postSlug={postSlug}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map(comment => (
              <div key={comment.id}>
                <CommentItem
                  comment={comment}
                  onReply={handleReply}
                />
                {replyingTo === comment.id && (
                  <div className="ml-6 mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Replying to {comment.author}
                    </h5>
                    <CommentForm
                      onSubmit={handleSubmitComment}
                      onCancel={() => setReplyingTo(null)}
                      parentId={comment.id}
                      postSlug={postSlug}
                      isSubmitting={isSubmitting}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}