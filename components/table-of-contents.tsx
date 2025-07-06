'use client'

import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { BookOpen } from 'lucide-react'

interface Heading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')

  // Extract headings from DOM (after markdown is rendered)
  useEffect(() => {
    const timer = setTimeout(() => {
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      const extractedHeadings: Heading[] = []
      
      headingElements.forEach((element) => {
        const level = parseInt(element.tagName.charAt(1))
        const text = element.textContent?.trim() || ''
        const id = element.id || ''
        
        if (id && text) {
          extractedHeadings.push({ id, text, level })
        }
      })
      
      setHeadings(extractedHeadings)
    }, 100) // Small delay to ensure DOM is ready
    
    return () => clearTimeout(timer)
  }, [content])

  // Intersection observer for active heading detection
  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the heading that's currently most visible
        const visibleHeadings = entries
          .filter(entry => entry.isIntersecting)
          .map(entry => ({
            id: entry.target.id,
            top: entry.boundingClientRect.top,
            ratio: entry.intersectionRatio
          }))
          .sort((a, b) => a.top - b.top)

        if (visibleHeadings.length > 0) {
          setActiveId(visibleHeadings[0].id)
        } else {
          // If no headings are visible, find the one closest to the top
          const allHeadings = headings.map(heading => {
            const element = document.getElementById(heading.id)
            return element ? {
              id: heading.id,
              top: element.getBoundingClientRect().top
            } : null
          }).filter(Boolean)
          
          if (allHeadings.length > 0) {
            const closestHeading = allHeadings.reduce((closest, current) => 
              Math.abs(current!.top) < Math.abs(closest!.top) ? current : closest
            )
            setActiveId(closestHeading!.id)
          }
        }
      },
      {
        rootMargin: '-10% 0% -80% 0%',
        threshold: [0, 0.1, 0.5, 1]
      }
    )

    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  // Scroll to heading
  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const header = document.querySelector('header')
      const headerHeight = header?.offsetHeight || 0
      const offset = headerHeight + 16
      
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }, [])

  if (headings.length === 0) return null

  return (
    <div className={cn(
      "space-y-3" // Simple spacing
    )}>
      {/* Simple header */}
      <div className={cn(
        "flex items-center justify-between", // Header layout with space between
        "text-sm font-medium text-foreground" // Text styling
      )}>
        <div className="flex items-center space-x-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span>Contents</span>
        </div>
        {/* Debug info - show active heading count */}
        <div className="text-xs text-muted-foreground">
          {headings.length} / {activeId ? '✓' : '✗'}
        </div>
      </div>

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
    </div>
  )
}