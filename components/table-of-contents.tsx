'use client'

import { cn } from '@/lib/utils'
import { BookOpen } from 'lucide-react'
import { useTableOfContents } from '@/hooks/use-table-of-contents'

interface TableOfContentsProps {
  content: string
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const { headings, activeId, scrollToHeading } = useTableOfContents(content)

  if (headings.length === 0) return null

  return (
    <div className="space-y-2">
      {/* Simple navigation list */}
      <div className="space-y-1">
        {headings.map((heading) => {
          const isActive = activeId === heading.id
          const paddingLeft = (heading.level - 1) * 12

          return (
            <button
              key={heading.id}
              onClick={() => scrollToHeading(heading.id)}
              className={cn(
                "w-full text-left text-sm leading-5", // Base styles
                "py-1 px-2 rounded transition-colors", // Padding and transitions
                "hover:bg-muted/50", // Hover state
                isActive 
                  ? "text-primary bg-primary/10 font-bold !font-bold" // Active state - force bold
                  : "text-muted-foreground hover:text-foreground" // Default state
              )}
              style={{ paddingLeft: `${paddingLeft + 8}px` }}
            >
              {heading.text}
            </button>
          )
        })}
      </div>
      
      {/* Footer info */}
      <div className="pt-2 border-t border-border/20">
        <div className="text-xs text-muted-foreground text-center">
          {headings.length} section{headings.length !== 1 ? 's' : ''} • {activeId ? 'Tracking' : 'Ready'}
        </div>
      </div>
    </div>
  )
}