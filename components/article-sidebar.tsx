'use client'

import { useState } from 'react'
import { TableOfContents } from './table-of-contents'
import { formatDate } from '@/lib/utils'
import { Calendar, Clock, Tag, Share2, Bookmark, CheckCircle2 } from 'lucide-react'
import { BlogPost } from '@/types/notion'

interface ArticleSidebarProps {
  post: BlogPost
}

export function ArticleSidebar({ post }: ArticleSidebarProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [shareCount, setShareCount] = useState(0)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.summary || '',
          url: window.location.href
        })
        setShareCount(prev => prev + 1)
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        setShareCount(prev => prev + 1)
        // You could show a toast notification here
      } catch (err) {
        console.log('Error copying to clipboard:', err)
      }
    }
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    // Here you would typically save to localStorage or send to backend
  }

  return (
    <aside className={
      // Hidden on mobile devices
      "hidden md:block " +
      // Base layout spacing
      "space-y-4"
    }>
      {/* Article Info */}
      <div className={
        // Card background styling
        "bg-card border rounded-lg " +
        // Reduced padding and spacing
        "p-4 space-y-3"
      }>
        <h3 className={
          // Title styling
          "font-semibold text-sm text-foreground " +
          // Reduced margin
          "mb-3"
        }>
          Article Details
        </h3>
        
        <div className={
          // Reduced spacing between items
          "space-y-2 text-sm"
        }>
          <div className={
            // Icon and text alignment
            "flex items-center space-x-2 " +
            // Muted text color
            "text-muted-foreground"
          }>
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>Published {formatDate(post.date)}</span>
          </div>
          
          {post.readingTime && (
            <div className={
              // Icon and text alignment
              "flex items-center space-x-2 " +
              // Muted text color
              "text-muted-foreground"
            }>
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>{post.readingTime} min read</span>
            </div>
          )}
          
          <div className={
            // Icon and text alignment
            "flex items-center space-x-2 " +
            // Muted text color
            "text-muted-foreground"
          }>
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>Updated {formatDate(post.lastEditedTime)}</span>
          </div>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className={
            // Top border separator
            "pt-3 border-t border-border/50"
          }>
            <div className={
              // Icon and text alignment
              "flex items-center space-x-2 " +
              // Reduced margin
              "mb-2"
            }>
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Tags</span>
            </div>
            <div className={
              // Tag wrapper with gap
              "flex flex-wrap gap-1"
            }>
              {post.tags.map((tag) => (
                <span 
                  key={tag}
                  className={
                    // Base tag styling
                    "inline-block px-2 py-1 text-xs font-medium " +
                    // Tag color scheme
                    "text-primary bg-primary/10 border border-primary/20 " +
                    // Tag shape
                    "rounded-full " +
                    // Hover effects
                    "hover:bg-primary/15 transition-colors cursor-pointer"
                  }
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className={
          // Top border separator
          "pt-3 border-t border-border/50 " +
          // Reduced spacing between buttons
          "space-y-2"
        }>
          <button
            onClick={handleShare}
            className={
              // Group hover effects
              "group w-full " +
              // Item alignment
              "flex items-center justify-between " +
              // Reduced padding
              "px-3 py-2 " +
              // Text styling
              "text-sm " +
              // Base color states
              "text-muted-foreground hover:text-foreground " +
              // Background color states
              "bg-muted/30 hover:bg-muted/50 " +
              // Shape styling
              "rounded-lg " +
              // Transition animations
              "transition-all duration-200"
            }
          >
            <div className={
              // Icon and text alignment
              "flex items-center space-x-2"
            }>
              <Share2 className="h-4 w-4" />
              <span>Share Article</span>
            </div>
            {shareCount > 0 && (
              <span className={
                // Count badge styling
                "text-xs bg-primary/20 text-primary " +
                // Badge shape
                "px-2 py-1 rounded-full"
              }>
                {shareCount}
              </span>
            )}
          </button>
          
          <button 
            onClick={handleBookmark}
            className={
              // Group hover effects
              "group w-full " +
              // Item alignment
              "flex items-center justify-between " +
              // Reduced padding
              "px-3 py-2 " +
              // Text styling
              "text-sm " +
              // Transition animations
              "transition-all duration-200 " +
              // Shape styling
              "rounded-lg"
            }
            style={{
              color: isBookmarked ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
              backgroundColor: isBookmarked ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--muted) / 0.3)',
              borderColor: isBookmarked ? 'hsl(var(--primary) / 0.2)' : 'transparent',
              borderWidth: '1px'
            }}
          >
            <div className={
              // Icon and text alignment
              "flex items-center space-x-2"
            }>
              {isBookmarked ? <CheckCircle2 className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </div>
            {isBookmarked && (
              <CheckCircle2 className="h-3 w-3 text-primary" />
            )}
          </button>
        </div>
      </div>
      {/* Table of Contents - More compact design */}
      {post.content && (
        <div className={
          // Card background styling
          "bg-card border rounded-lg " +
          // Reduced padding
          "p-4"
        }>
          <TableOfContents content={post.content} />
        </div>
      )}

    </aside>
  )
}