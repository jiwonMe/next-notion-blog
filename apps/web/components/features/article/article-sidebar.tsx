'use client'

import { TableOfContents } from './table-of-contents'
import { formatDate } from '@/lib/utils'
import { Calendar, Clock, Tag, BookOpen, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { BlogPost } from '@noxion/types'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { useTableOfContents } from '@/hooks/use-table-of-contents'

interface ArticleSidebarProps {
  post: BlogPost
}

export function ArticleSidebar({ post }: ArticleSidebarProps) {
  const [articleInfoOpen, setArticleInfoOpen] = useState(true)
  const [tocOpen, setTocOpen] = useState(true)
  const { headings } = useTableOfContents(post.content)

  // Auto-collapse logic based on content and screen space
  useEffect(() => {
    const hasLongContent = post.tags.length > 3
    const hasToc = headings.length > 0
    const hasLongTags = post.tags.length > 5
    const hasLongToc = headings.length > 8
    
    // Smart collapse logic:
    // 1. If no TOC, keep article info open
    // 2. If both exist and many tags or long TOC, prioritize TOC
    // 3. If moderate content, keep both open
    if (hasToc) {
      if (hasLongTags || hasLongToc) {
        // Prioritize TOC when content is dense
        setArticleInfoOpen(false)
        setTocOpen(true)
      } else if (hasLongContent && headings.length > 4) {
        // Both have moderate content, collapse article info
        setArticleInfoOpen(false)
        setTocOpen(true)
      } else {
        // Light content, keep both open
        setArticleInfoOpen(true)
        setTocOpen(true)
      }
    } else {
      // No TOC, keep article info open
      setArticleInfoOpen(true)
    }
  }, [post, headings.length])

  return (
    <aside className={cn(
      "hidden md:block space-y-4 sticky top-24"
    )}>
      {/* Article Info */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <button
          onClick={() => setArticleInfoOpen(!articleInfoOpen)}
          className={cn(
            "w-full p-4 text-left transition-all duration-200",
            "hover:bg-muted/30 flex items-center justify-between",
            articleInfoOpen ? "bg-transparent" : "bg-muted/10"
          )}
        >
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">Article Info</span>
            {post.tags.length > 0 && (
              <span className="text-xs text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded-full">
                {post.tags.length}
              </span>
            )}
          </div>
          {articleInfoOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        
        <div className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          articleInfoOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="px-4 pb-4 space-y-4 border-t border-border/50">
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
                        "inline-block px-2 py-1 text-xs",
                        "text-muted-foreground bg-muted/50",
                        "rounded-full border border-border/30"
                      )}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      {post.content && (
        <div className="bg-card border rounded-lg overflow-hidden">
          <button
            onClick={() => setTocOpen(!tocOpen)}
            className={cn(
              "w-full p-4 text-left transition-all duration-200",
              "hover:bg-muted/30 flex items-center justify-between",
              tocOpen ? "bg-transparent" : "bg-muted/10"
            )}
          >
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Table of Contents</span>
              {headings.length > 0 && (
                <span className="text-xs text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded-full">
                  {headings.length}
                </span>
              )}
            </div>
            {tocOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          
          <div className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden",
            tocOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          )}>
            <div className="p-4 border-t border-border/50">
              <TableOfContents content={post.content} />
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}