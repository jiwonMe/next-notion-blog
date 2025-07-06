'use client'

import { TableOfContents } from './table-of-contents'
import { formatDate } from '@/lib/utils'
import { Calendar, Clock, Tag } from 'lucide-react'
import { BlogPost } from '@/types/notion'
import { cn } from '@/lib/utils'

interface ArticleSidebarProps {
  post: BlogPost
}

export function ArticleSidebar({ post }: ArticleSidebarProps) {
  return (
    <aside className="hidden md:block space-y-6 sticky top-24">
      {/* Article Info */}
      <div className={cn(
        "bg-card border rounded-lg p-4 space-y-4" // Simple card styling
      )}>
        <h3 className="font-medium text-foreground">
          Article Info
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Published {formatDate(post.date)}</span>
          </div>
          
          {post.readingTime && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{post.readingTime} min read</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Updated {formatDate(post.lastEditedTime)}</span>
          </div>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="pt-3 border-t border-border/50">
            <div className="flex items-center space-x-2 mb-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Tags</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag) => (
                <span 
                  key={tag}
                  className={cn(
                    "inline-block px-2 py-1 text-xs", // Basic tag styling
                    "text-muted-foreground bg-muted/50", // Simple colors
                    "rounded-full border border-border/30" // Clean borders
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table of Contents */}
      {post.content && (
        <div className="bg-card border rounded-lg p-4">
          <TableOfContents content={post.content} />
        </div>
      )}
    </aside>
  )
}