'use client'

import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { ChevronRight, BookOpen, MapPin } from 'lucide-react'

interface Heading {
  id: string
  text: string
  level: number
  element?: HTMLElement
}

interface TableOfContentsProps {
  content: string
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [visibleHeadings, setVisibleHeadings] = useState<Set<string>>(new Set())
  const [scrollProgress, setScrollProgress] = useState(0)
  const progressBarRef = useRef<HTMLDivElement>(null)

  // Extract headings from markdown content
  useEffect(() => {
    const headingRegex = /^(#{1,6})\s+(.*)$/gm
    const extractedHeadings: Heading[] = []
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()
      
      extractedHeadings.push({ id, text, level })
    }

    setHeadings(extractedHeadings)
  }, [content])

  // Enhanced tracking with multiple intersection observers
  useEffect(() => {
    if (headings.length === 0) return

    // Find all heading elements and update our headings array
    const headingElements = headings.map(heading => {
      const element = document.getElementById(heading.id)
      return { ...heading, element }
    }).filter(h => h.element)

    if (headingElements.length === 0) return

    // Observer for active heading (what's currently in focus)
    const activeObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(entry => entry.isIntersecting)
        if (visibleEntries.length > 0) {
          // Get the topmost visible heading
          const topEntry = visibleEntries.reduce((top, entry) => 
            entry.boundingClientRect.top < top.boundingClientRect.top ? entry : top
          )
          setActiveId(topEntry.target.id)
        }
      },
      {
        rootMargin: '-10% 0% -90% 0%',
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    )

    // Observer for visibility tracking (what's in viewport)
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        setVisibleHeadings(prev => {
          const newVisible = new Set(prev)
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              newVisible.add(entry.target.id)
            } else {
              newVisible.delete(entry.target.id)
            }
          })
          return newVisible
        })
      },
      {
        rootMargin: '0px',
        threshold: 0
      }
    )

    headingElements.forEach(({ element }) => {
      if (element) {
        activeObserver.observe(element)
        visibilityObserver.observe(element)
      }
    })

    return () => {
      activeObserver.disconnect()
      visibilityObserver.disconnect()
    }
  }, [headings])

  // Dynamic progress tracking
  useEffect(() => {
    const updateProgress = () => {
      if (headings.length === 0) return

      const article = document.querySelector('article')
      if (!article) return

      const articleRect = article.getBoundingClientRect()
      const articleHeight = article.offsetHeight
      const viewportHeight = window.innerHeight
      const scrolled = Math.max(0, -articleRect.top)
      const totalScrollable = Math.max(0, articleHeight - viewportHeight)
      
      if (totalScrollable === 0) {
        setScrollProgress(100)
        return
      }

      const progressPercent = Math.min(100, (scrolled / totalScrollable) * 100)
      setScrollProgress(progressPercent)

      // Update progress bar position based on active heading
      if (progressBarRef.current && activeId) {
        const activeIndex = headings.findIndex(h => h.id === activeId)
        if (activeIndex !== -1) {
          const progressPosition = (activeIndex / (headings.length - 1)) * 100
          progressBarRef.current.style.setProperty('--progress-position', `${progressPosition}%`)
        }
      }
    }

    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress()

    return () => window.removeEventListener('scroll', updateProgress)
  }, [headings, activeId])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100 // Account for sticky header
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  const getHeadingProgress = (headingId: string) => {
    const index = headings.findIndex(h => h.id === headingId)
    const activeIndex = headings.findIndex(h => h.id === activeId)
    
    if (index < activeIndex) return 100 // Passed
    if (index === activeIndex) return 50 // Current
    return 0 // Not reached
  }

  if (headings.length === 0) return null

  return (
    <div className="sticky top-24 space-y-6">
      {/* Enhanced Header with Progress */}
      <div className="relative">
        <div className="flex items-center justify-between text-sm font-medium text-foreground mb-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Contents</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{Math.round(scrollProgress)}%</span>
          </div>
        </div>
        
        {/* Mini progress indicator */}
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>

      {/* Enhanced Navigation with Visual Indicators */}
      <nav className="relative">
        {/* Progress timeline */}
        <div 
          ref={progressBarRef}
          className="absolute left-2 top-0 bottom-0 w-0.5 bg-muted rounded-full overflow-hidden"
          style={{ '--progress-position': '0%' } as React.CSSProperties}
        >
          <div 
            className="w-full bg-gradient-to-b from-primary via-primary/80 to-primary/60 transition-all duration-500 ease-out"
            style={{ height: `${scrollProgress}%` }}
          />
          {/* Active indicator dot */}
          <div 
            className="absolute w-2 h-2 bg-primary rounded-full -left-0.5 transition-all duration-300 ease-out shadow-lg"
            style={{ 
              top: `var(--progress-position)`,
              opacity: activeId ? 1 : 0,
              transform: 'translateY(-50%)'
            }}
          />
        </div>

        <div className="space-y-1 pl-6">
          {headings.map((heading, index) => {
            const isActive = activeId === heading.id
            const isVisible = visibleHeadings.has(heading.id)
            const marginLeft = (heading.level - 1) * 16
            const progress = getHeadingProgress(heading.id)

            return (
              <button
                key={heading.id}
                onClick={() => scrollToHeading(heading.id)}
                className={cn(
                  "group flex items-start w-full text-left text-sm transition-all duration-300 py-2 px-3 rounded-xl relative overflow-hidden",
                  isActive 
                    ? "text-primary bg-primary/10 shadow-sm border border-primary/20 scale-105" 
                    : isVisible
                    ? "text-foreground bg-muted/30 hover:bg-muted/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
                style={{ marginLeft: `${marginLeft}px` }}
              >
                {/* Progress background */}
                <div 
                  className={cn(
                    "absolute inset-0 transition-all duration-500 ease-out",
                    progress === 100 ? "bg-primary/5" : progress === 50 ? "bg-primary/8" : ""
                  )}
                  style={{ 
                    width: progress === 50 ? `${scrollProgress}%` : progress === 100 ? '100%' : '0%'
                  }}
                />
                
                {/* Content */}
                <div className="relative flex items-start w-full">
                  <div className={cn(
                    "flex-shrink-0 w-1 h-1 rounded-full mt-2 mr-3 transition-all duration-300",
                    isActive ? "bg-primary scale-150" : 
                    isVisible ? "bg-foreground/60" : "bg-muted-foreground/40"
                  )} />
                  
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      "block leading-5 transition-all duration-300",
                      isActive && "font-medium"
                    )}>
                      {heading.text}
                    </span>
                    
                    {/* Level indicator */}
                    <div className={cn(
                      "text-xs mt-1 opacity-0 transition-opacity duration-200",
                      (isActive || isVisible) && "opacity-50"
                    )}>
                      H{heading.level}
                    </div>
                  </div>

                  {/* Active chevron */}
                  <ChevronRight 
                    className={cn(
                      "h-3 w-3 transition-all duration-300 flex-shrink-0 mt-0.5",
                      isActive ? "rotate-90 text-primary scale-110" : 
                      "opacity-0 group-hover:opacity-50 group-hover:rotate-90"
                    )}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Enhanced Reading Stats */}
      <div className="pt-4 border-t border-border/50 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Reading Progress</span>
          <span className="font-medium">{Math.round(scrollProgress)}%</span>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Current Section</span>
          <span className="font-medium truncate max-w-24">
            {activeId ? headings.find(h => h.id === activeId)?.text.slice(0, 15) + '...' : 'Top'}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Sections</span>
          <span className="font-medium">
            {headings.findIndex(h => h.id === activeId) + 1} / {headings.length}
          </span>
        </div>
      </div>
    </div>
  )
}