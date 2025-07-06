'use client'

import { useState, useEffect } from 'react'
import { TableOfContents } from './table-of-contents'
import { formatDate } from '@/lib/utils'
import { Calendar, Clock, Tag, Share2, Bookmark, CheckCircle2, Eye, TrendingUp } from 'lucide-react'
import { BlogPost } from '@/types/notion'

interface ArticleSidebarProps {
  post: BlogPost
}

export function ArticleSidebar({ post }: ArticleSidebarProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [shareCount, setShareCount] = useState(0)
  const [readingStats, setReadingStats] = useState({
    timeSpent: 0,
    scrollSpeed: 0,
    lastPosition: 0
  })

  // Track reading behavior
  useEffect(() => {
    let startTime = Date.now()
    let lastScrollY = window.scrollY
    let lastScrollTime = Date.now()

    const updateReadingStats = () => {
      const currentTime = Date.now()
      const currentScrollY = window.scrollY
      const timeSpent = Math.floor((currentTime - startTime) / 1000)
      
      // Calculate scroll speed (pixels per second)
      const scrollDelta = Math.abs(currentScrollY - lastScrollY)
      const timeDelta = currentTime - lastScrollTime
      const scrollSpeed = timeDelta > 0 ? Math.round(scrollDelta / (timeDelta / 1000)) : 0

      setReadingStats(prev => ({
        timeSpent,
        scrollSpeed,
        lastPosition: currentScrollY
      }))

      lastScrollY = currentScrollY
      lastScrollTime = currentTime
    }

    const interval = setInterval(updateReadingStats, 1000)
    const scrollHandler = () => updateReadingStats()

    window.addEventListener('scroll', scrollHandler, { passive: true })

    return () => {
      clearInterval(interval)
      window.removeEventListener('scroll', scrollHandler)
    }
  }, [])

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

  const formatReadingTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ${seconds % 60}s`
  }

  return (
    <aside className="space-y-6">
      {/* Live Reading Stats */}
      <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/20 rounded-xl p-5 space-y-4">
        <div className="flex items-center space-x-2 text-sm font-medium text-primary mb-3">
          <Eye className="h-4 w-4" />
          <span>Reading Session</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Time Spent</div>
            <div className="font-semibold text-foreground">
              {formatReadingTime(readingStats.timeSpent)}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Read Speed</div>
            <div className="font-semibold text-foreground flex items-center space-x-1">
              <TrendingUp className="h-3 w-3" />
              <span>{readingStats.scrollSpeed}px/s</span>
            </div>
          </div>
        </div>

        {/* Estimated completion */}
        <div className="pt-3 border-t border-primary/20">
          <div className="text-xs text-muted-foreground mb-1">Estimated Time Left</div>
          <div className="text-sm font-medium">
            {post.readingTime ? `~${Math.max(0, post.readingTime - Math.floor(readingStats.timeSpent / 60))} min` : 'N/A'}
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      {post.content && (
        <div className="bg-card border rounded-xl p-6">
          <TableOfContents content={post.content} />
        </div>
      )}

      {/* Article Info */}
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-sm text-foreground mb-4">Article Details</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-center space-x-3 text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>Published {formatDate(post.date)}</span>
          </div>
          
          {post.readingTime && (
            <div className="flex items-center space-x-3 text-muted-foreground">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>{post.readingTime} min read</span>
            </div>
          )}
          
          <div className="flex items-center space-x-3 text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>Updated {formatDate(post.lastEditedTime)}</span>
          </div>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="pt-3 border-t border-border/50">
            <div className="flex items-center space-x-2 mb-3">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span 
                  key={tag}
                  className="inline-block px-3 py-1 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full hover:bg-primary/15 transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Actions */}
        <div className="pt-3 border-t border-border/50 space-y-2">
          <button
            onClick={handleShare}
            className="group w-full flex items-center justify-between px-4 py-3 text-sm text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 rounded-lg transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center space-x-2">
              <Share2 className="h-4 w-4" />
              <span>Share Article</span>
            </div>
            {shareCount > 0 && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                {shareCount}
              </span>
            )}
          </button>
          
          <button 
            onClick={handleBookmark}
            className="group w-full flex items-center justify-between px-4 py-3 text-sm transition-all duration-200 hover:scale-105 rounded-lg"
            style={{
              color: isBookmarked ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
              backgroundColor: isBookmarked ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--muted) / 0.3)',
              borderColor: isBookmarked ? 'hsl(var(--primary) / 0.2)' : 'transparent',
              borderWidth: '1px'
            }}
          >
            <div className="flex items-center space-x-2">
              {isBookmarked ? <CheckCircle2 className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </div>
            {isBookmarked && (
              <CheckCircle2 className="h-3 w-3 text-primary" />
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}