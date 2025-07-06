'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { ChevronRight, BookOpen, MapPin, Clock, Eye } from 'lucide-react'

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
  const [estimatedReadTime, setEstimatedReadTime] = useState(0)
  const [hoveredId, setHoveredId] = useState<string>('')
  const [isCompact, setIsCompact] = useState(false)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const focusedIndexRef = useRef<number>(-1)

  // Extract headings from markdown content with improved parsing
  useEffect(() => {
    const headingRegex = /^(#{1,6})\s+(.*)$/gm
    const extractedHeadings: Heading[] = []
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length
      const text = match[2].trim()
      // Improved ID generation with better handling of special characters
      const id = text
        .toLowerCase()
        .replace(/[^\w\s가-힣-]/g, '') // Support Korean characters
        .replace(/\s+/g, '-')
        .trim()
      
      extractedHeadings.push({ id, text, level })
    }

    setHeadings(extractedHeadings)
    
    // Calculate estimated reading time (average 200 words per minute)
    const wordCount = content.split(/\s+/).length
    const readTime = Math.ceil(wordCount / 200)
    setEstimatedReadTime(readTime)
  }, [content])

  // Enhanced intersection observer with better performance
  useEffect(() => {
    if (headings.length === 0) return

    const headingElements = headings.map(heading => {
      const element = document.getElementById(heading.id)
      return { ...heading, element }
    }).filter(h => h.element)

    if (headingElements.length === 0) return

    // Optimized observer for active heading
    const activeObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(entry => entry.isIntersecting)
        if (visibleEntries.length > 0) {
          const topEntry = visibleEntries.reduce((top, entry) => 
            entry.boundingClientRect.top < top.boundingClientRect.top ? entry : top
          )
          setActiveId(topEntry.target.id)
        }
      },
      {
        rootMargin: '-10% 0% -85% 0%',
        threshold: [0, 0.1, 0.5, 1]
      }
    )

    // Visibility observer with debouncing
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
        rootMargin: '20% 0% 20% 0%',
        threshold: 0.1
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

  // Improved progress tracking with throttling
  useEffect(() => {
    let animationId: number

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

      // Update progress bar position with smooth animation
      if (progressBarRef.current && activeId) {
        const activeIndex = headings.findIndex(h => h.id === activeId)
        if (activeIndex !== -1) {
          const progressPosition = (activeIndex / Math.max(1, headings.length - 1)) * 100
          progressBarRef.current.style.setProperty('--progress-position', `${progressPosition}%`)
        }
      }
    }

    const throttledUpdate = () => {
      cancelAnimationFrame(animationId)
      animationId = requestAnimationFrame(updateProgress)
    }

    window.addEventListener('scroll', throttledUpdate, { passive: true })
    updateProgress()

    return () => {
      window.removeEventListener('scroll', throttledUpdate)
      cancelAnimationFrame(animationId)
    }
  }, [headings, activeId])

  // Keyboard navigation support
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target !== document.body) return

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      const direction = e.key === 'ArrowUp' ? -1 : 1
      const newIndex = Math.max(0, Math.min(headings.length - 1, focusedIndexRef.current + direction))
      focusedIndexRef.current = newIndex
      
      if (headings[newIndex]) {
        scrollToHeading(headings[newIndex].id)
      }
    }
  }, [headings])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Enhanced scroll to heading with offset calculation
  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const header = document.querySelector('header')
      const headerHeight = header?.offsetHeight || 0
      const offset = headerHeight + 24 // Additional padding
      
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }, [])

  // Get heading progress with more granular states
  const getHeadingProgress = useCallback((headingId: string) => {
    const index = headings.findIndex(h => h.id === headingId)
    const activeIndex = headings.findIndex(h => h.id === activeId)
    
    if (index < activeIndex) return 100 // Completed
    if (index === activeIndex) return scrollProgress // Current progress
    return 0 // Not started
  }, [headings, activeId, scrollProgress])

  // Toggle compact mode based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      setIsCompact(scrolled > 300)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (headings.length === 0) return null

  return (
    <div className={cn(
      // Base container styles
      "sticky top-20 space-y-4 transition-all duration-500 ease-out",
      // Responsive positioning
      "lg:top-24",
      // Compact mode adjustments
      isCompact ? "top-16 lg:top-20" : ""
    )}>
      {/* Enhanced header with statistics */}
      <div className={cn(
        // Header container
        "relative p-4 rounded-2xl transition-all duration-300",
        // Background and border
        "bg-gradient-to-br from-background via-background to-muted/20",
        "border border-border/50 backdrop-blur-sm",
        // Shadow effects
        "shadow-lg shadow-black/5",
        // Compact mode styles
        isCompact ? "p-3 rounded-xl" : ""
      )}>
        {/* Header content */}
        <div className={cn(
          // Header layout
          "flex items-center justify-between mb-3",
          // Text styling
          "text-sm font-medium text-foreground"
        )}>
          <div className={cn(
            // Icon and title container
            "flex items-center space-x-2"
          )}>
            <BookOpen className={cn(
              // Icon size and color
              "h-4 w-4 text-primary",
              // Compact mode
              isCompact ? "h-3 w-3" : ""
            )} />
                         <span className={cn(
               // Title text
               "font-semibold",
               // Compact mode
               isCompact ? "text-xs" : ""
             )}>
               Contents
             </span>
          </div>
          
          {/* Reading stats */}
          <div className={cn(
            // Stats container
            "flex items-center space-x-3 text-xs text-muted-foreground"
          )}>
            <div className={cn(
              // Progress indicator
              "flex items-center space-x-1"
            )}>
              <MapPin className="h-3 w-3" />
              <span className="font-medium">
                {Math.round(scrollProgress)}%
              </span>
            </div>
            
            {!isCompact && (
              <div className={cn(
                // Reading time indicator
                "flex items-center space-x-1"
              )}>
                                 <Clock className="h-3 w-3" />
                 <span>{estimatedReadTime} min</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Enhanced progress bar */}
        <div className={cn(
          // Progress container
          "relative w-full h-2 bg-muted/50 rounded-full overflow-hidden",
          // Compact mode
          isCompact ? "h-1.5" : ""
        )}>
          {/* Progress fill */}
          <div className={cn(
            // Progress bar styling
            "h-full rounded-full transition-all duration-500 ease-out",
            // Gradient background
            "bg-gradient-to-r from-primary via-primary/90 to-primary/80",
            // Glow effect
            "shadow-sm shadow-primary/20"
          )}
          style={{ width: `${scrollProgress}%` }}
          />
          
          {/* Reading milestones */}
          <div className={cn(
            // Milestone container
            "absolute inset-0 flex items-center justify-between px-1"
          )}>
            {[25, 50, 75].map((milestone) => (
              <div
                key={milestone}
                className={cn(
                  // Milestone dot
                  "w-1 h-1 rounded-full transition-all duration-300",
                  // Color based on progress
                  scrollProgress >= milestone 
                    ? "bg-primary-foreground/80" 
                    : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced navigation with improved visuals */}
      <div className={cn(
        // Navigation container
        "relative p-4 rounded-2xl transition-all duration-300",
        // Background and styling
        "bg-gradient-to-br from-background via-background to-muted/10",
        "border border-border/30 backdrop-blur-sm",
        // Shadow effects
        "shadow-md shadow-black/5",
        // Compact mode
        isCompact ? "p-3 rounded-xl" : ""
      )}>
        {/* Progress timeline */}
        <div 
          ref={progressBarRef}
          className={cn(
            // Timeline positioning
            "absolute left-6 top-0 bottom-0 w-0.5 rounded-full overflow-hidden",
            // Background styling
            "bg-gradient-to-b from-muted via-muted/80 to-muted/60",
            // Compact mode
            isCompact ? "left-5" : ""
          )}
          style={{ '--progress-position': '0%' } as React.CSSProperties}
        >
          {/* Timeline progress */}
          <div className={cn(
            // Progress fill
            "w-full transition-all duration-700 ease-out",
            // Gradient styling
            "bg-gradient-to-b from-primary via-primary/90 to-primary/70",
            // Glow effect
            "shadow-sm shadow-primary/30"
          )}
          style={{ height: `${scrollProgress}%` }}
          />
          
          {/* Active position indicator */}
          <div className={cn(
            // Indicator positioning
            "absolute w-3 h-3 rounded-full -left-1 transition-all duration-300 ease-out",
            // Styling
            "bg-primary border-2 border-background",
            // Shadow effects
            "shadow-lg shadow-primary/40",
            // Pulse animation for active state
            activeId ? "animate-pulse" : ""
          )}
          style={{ 
            top: `var(--progress-position)`,
            opacity: activeId ? 1 : 0,
            transform: 'translateY(-50%)'
          }}
          />
        </div>

        {/* Navigation items */}
        <div className={cn(
          // Items container
          "space-y-1 ml-10",
          // Compact mode
          isCompact ? "ml-8 space-y-0.5" : ""
        )}>
          {headings.map((heading, index) => {
            const isActive = activeId === heading.id
            const isVisible = visibleHeadings.has(heading.id)
            const isHovered = hoveredId === heading.id
            const progress = getHeadingProgress(heading.id)
            const marginLeft = (heading.level - 1) * (isCompact ? 12 : 16)

            return (
              <button
                key={heading.id}
                onClick={() => scrollToHeading(heading.id)}
                onMouseEnter={() => setHoveredId(heading.id)}
                onMouseLeave={() => setHoveredId('')}
                className={cn(
                  // Button base styles
                  "group relative flex items-start w-full text-left transition-all duration-300",
                  // Padding and spacing
                  "py-2.5 px-4 rounded-xl overflow-hidden",
                  // Compact mode
                  isCompact ? "py-2 px-3 rounded-lg" : "",
                  // Active state styles
                  isActive && [
                    "text-primary bg-primary/10 scale-105 shadow-sm",
                    "border border-primary/20 shadow-primary/10"
                  ],
                  // Visible state styles
                  isVisible && !isActive && [
                    "text-foreground bg-muted/40 hover:bg-muted/60"
                  ],
                  // Default state styles
                  !isVisible && !isActive && [
                    "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  ],
                  // Hover effects
                  isHovered && !isActive && "scale-102 shadow-sm"
                )}
                style={{ marginLeft: `${marginLeft}px` }}
                                 aria-label={`${heading.text} (level ${heading.level})`}
              >
                {/* Progress background overlay */}
                <div className={cn(
                  // Progress overlay
                  "absolute inset-0 transition-all duration-700 ease-out",
                  // Progress-based styling
                  progress === 100 && "bg-primary/5",
                  progress > 0 && progress < 100 && "bg-primary/8"
                )}
                style={{ 
                  width: progress > 0 && progress < 100 ? `${progress}%` : 
                         progress === 100 ? '100%' : '0%'
                }}
                />
                
                {/* Content container */}
                <div className="relative flex items-start w-full">
                  {/* Level indicator dot */}
                  <div className={cn(
                    // Dot positioning and base styles
                    "flex-shrink-0 rounded-full mt-2 mr-3 transition-all duration-300",
                    // Size based on heading level
                    heading.level <= 2 ? "w-1.5 h-1.5" : "w-1 h-1",
                    // Color based on state
                    isActive ? "bg-primary scale-150 shadow-lg shadow-primary/50" : 
                    isVisible ? "bg-foreground/70 scale-125" : "bg-muted-foreground/50",
                    // Compact mode
                    isCompact ? "mt-1.5" : ""
                  )} />
                  
                  {/* Text content */}
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      // Text styling
                      "block leading-5 transition-all duration-300",
                      // Font weight based on level and state
                      heading.level <= 2 ? "font-medium" : "font-normal",
                      isActive && "font-semibold",
                      // Compact mode
                      isCompact ? "text-sm leading-4" : ""
                    )}>
                      {heading.text}
                    </span>
                    
                    {/* Level and progress indicator */}
                    <div className={cn(
                      // Indicator container
                      "flex items-center space-x-2 mt-1 text-xs transition-opacity duration-200",
                      // Visibility based on state
                      (isActive || isVisible || isHovered) ? "opacity-60" : "opacity-0"
                    )}>
                      <span className={cn(
                        // Level indicator
                        "text-muted-foreground"
                      )}>
                        H{heading.level}
                      </span>
                      
                      {progress > 0 && progress < 100 && (
                        <div className={cn(
                          // Progress indicator
                          "flex items-center space-x-1"
                        )}>
                          <Eye className="h-3 w-3 text-primary" />
                          <span className="text-primary font-medium">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Navigation chevron */}
                  <ChevronRight className={cn(
                    // Chevron base styles
                    "h-4 w-4 transition-all duration-300 flex-shrink-0 mt-0.5",
                    // Compact mode
                    isCompact ? "h-3 w-3" : "",
                    // Active state
                    isActive ? "rotate-90 text-primary scale-110" : 
                    // Hover state
                    isHovered ? "rotate-90 text-foreground/80 scale-105" :
                    // Default state
                    "opacity-0 group-hover:opacity-60 group-hover:rotate-90"
                  )} />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Enhanced reading statistics */}
      <div className={cn(
        // Stats container
        "p-4 rounded-2xl transition-all duration-300",
        // Background and styling
        "bg-gradient-to-br from-muted/30 via-muted/20 to-background",
        "border border-border/20 backdrop-blur-sm",
        // Shadow effects
        "shadow-sm shadow-black/5",
        // Compact mode
        isCompact ? "p-3 rounded-xl" : ""
      )}>
        <div className={cn(
          // Grid layout
          "grid grid-cols-2 gap-4",
          // Compact mode
          isCompact ? "gap-3" : ""
        )}>
          {/* Reading progress */}
          <div className={cn(
            // Progress stat container
            "text-center p-3 rounded-xl",
            // Background
            "bg-primary/5 border border-primary/10",
            // Compact mode
            isCompact ? "p-2 rounded-lg" : ""
          )}>
            <div className={cn(
              // Progress value
              "text-lg font-bold text-primary",
              // Compact mode
              isCompact ? "text-base" : ""
            )}>
              {Math.round(scrollProgress)}%
            </div>
                         <div className={cn(
               // Progress label
               "text-xs text-muted-foreground mt-1"
             )}>
               Progress
             </div>
          </div>
          
          {/* Current section */}
          <div className={cn(
            // Section stat container
            "text-center p-3 rounded-xl",
            // Background
            "bg-muted/20 border border-muted/30",
            // Compact mode
            isCompact ? "p-2 rounded-lg" : ""
          )}>
            <div className={cn(
              // Section value
              "text-lg font-bold text-foreground",
              // Compact mode
              isCompact ? "text-base" : ""
            )}>
              {headings.findIndex(h => h.id === activeId) + 1}
            </div>
                         <div className={cn(
               // Section label
               "text-xs text-muted-foreground mt-1"
             )}>
               Current Section
             </div>
          </div>
        </div>
        
        {/* Additional stats in non-compact mode */}
        {!isCompact && (
          <div className={cn(
            // Additional stats container
            "mt-4 pt-4 border-t border-border/20",
            // Layout
            "flex items-center justify-between text-xs"
          )}>
                         <div className={cn(
               // Stat item
               "flex items-center space-x-1 text-muted-foreground"
             )}>
               <Clock className="h-3 w-3" />
               <span>Est. reading time: {estimatedReadTime} min</span>
             </div>
            
                         <div className={cn(
               // Stat item
               "flex items-center space-x-1 text-muted-foreground"
             )}>
               <BookOpen className="h-3 w-3" />
               <span>Total {headings.length} sections</span>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}