'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '../common/theme-toggle'
import { ProgressiveBlurBackdrop } from '../common/progressive-blur-backdrop'
import { Sparkles, Menu, X, Home, FileText, User, BookOpen, List } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useTableOfContents } from '@/hooks/use-table-of-contents'
import { useScrollProgress } from '@/hooks/use-scroll-progress'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/articles', label: 'Articles', icon: FileText },
  { href: '/about', label: 'About', icon: User },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [tocOpen, setTocOpen] = useState(false)
  const { headings, activeId, scrollToHeading } = useTableOfContents()
  const { isScrolled, scrollProgress, scrollDirection, isScrolling } = useScrollProgress({
    scrollThreshold: 50,
    maxScrollDistance: 200,
  })
  const tocRef = useRef<HTMLDivElement>(null)

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  // Check if we're on an article page
  const isArticlePage = pathname.startsWith('/articles/') && pathname.includes('/')
  const showTableOfContents = isArticlePage && headings.length > 0

  // Close TOC dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tocRef.current && !tocRef.current.contains(event.target as Node)) {
        setTocOpen(false)
      }
    }

    if (tocOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [tocOpen])

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full",
      "flex items-center justify-center",
      "transition-all duration-500 ease-in-out",
      isScrolled ? "pt-2 px-4" : "px-4 py-3"
    )}>
      {/* Morphing container */}
      <div className="relative w-full">
        {/* Progressive Blur Backdrop */}
        <ProgressiveBlurBackdrop
          scrollProgress={scrollProgress}
          isScrolled={isScrolled}
        />
        
        {/* Main navigation container */}
        <div className={cn(
          "relative border transition-all duration-500 ease-in-out",
          "backdrop-blur-2xl supports-[backdrop-filter]:bg-background/90",
          "transform-gpu will-change-transform", // Performance optimization
          isScrolled 
            ? "rounded-full shadow-lg bg-background/90 border-border/50 shadow-black/20 dark:shadow-black/40 max-w-fit mx-auto"
            : "rounded-none border-b border-border/20 bg-background/80 shadow-none max-w-7xl mx-auto"
        )}>
          <div className={cn(
            "flex items-center transition-all duration-500",
            isScrolled 
              ? "px-4 py-2 min-w-fit" 
              : "px-0 py-0"
          )}>
            
            {/* Logo Section */}
            <div className={cn(
              "flex-shrink-0 transition-all duration-500",
              isScrolled ? "" : "mr-auto"
            )}>
              <Link 
                href="/" 
                className={cn(
                  "group flex items-center transition-all duration-500 hover:scale-105",
                  isScrolled ? "space-x-2" : "space-x-3"
                )}
              >
                <div className={cn(
                  "bg-primary rounded-full shadow-sm group-hover:shadow-md transition-all duration-500",
                  isScrolled ? "p-1.5" : "p-2"
                )}>
                  <Sparkles className={cn(
                    "text-white transition-all duration-500",
                    isScrolled ? "h-4 w-4" : "h-5 w-5"
                  )} />
                </div>
                <span className={cn(
                  "font-semibold transition-all duration-500",
                  isScrolled 
                    ? "text-sm opacity-0 w-0 overflow-hidden" 
                    : "text-lg opacity-100 w-auto"
                )}>
                  Blog
                </span>
              </Link>
            </div>
            
            {/* Center: Desktop Navigation */}
            <div className={cn(
              "transition-all duration-500",
              isScrolled 
                ? "flex-1 flex justify-center mx-6" 
                : "flex-1 flex justify-center"
            )}>
              <nav className="hidden md:flex items-center">
                <div className={cn(
                  "flex items-center space-x-1 transition-all duration-500",
                  isScrolled 
                    ? "bg-muted/20 rounded-full p-1" 
                    : "bg-transparent p-0"
                )}>
                  {navItems.map((item) => {
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "relative flex items-center space-x-2 text-sm font-medium rounded-full transition-all duration-500",
                          isScrolled 
                            ? "px-3 py-1.5" 
                            : "px-4 py-2",
                          active
                            ? isScrolled
                              ? "bg-background/90 text-foreground shadow-md shadow-black/5 border border-border/50 scale-105"
                              : "bg-primary/10 text-primary border border-primary/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/40 hover:scale-105"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className={cn(
                          "transition-all duration-500",
                          isScrolled ? "hidden lg:block" : "block"
                        )}>
                          {item.label}
                        </span>
                        {active && isScrolled && (
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 opacity-50" />
                        )}
                      </Link>
                    )
                  })}
                </div>
              </nav>
            </div>
            
            {/* Right: Actions */}
            <div className={cn(
              "flex-shrink-0 flex items-center space-x-2 transition-all duration-500",
              isScrolled ? "" : "ml-auto"
            )}>
              {/* Table of Contents button */}
              {showTableOfContents && (
                <button
                  onClick={() => setTocOpen(!tocOpen)}
                  className={cn(
                    "p-2 text-muted-foreground hover:text-foreground",
                    "hover:bg-muted/30 rounded-full transition-all duration-300",
                    "relative",
                    isScrolled ? "hover:scale-110" : "",
                    tocOpen ? "bg-primary/10 text-primary" : ""
                  )}
                >
                  <List className="h-4 w-4" />
                  {activeId && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                </button>
              )}
              
              <ThemeToggle />
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={cn(
                  "md:hidden p-2 text-muted-foreground hover:text-foreground",
                  "hover:bg-muted/30 rounded-full transition-all duration-300",
                  isScrolled ? "hover:scale-110" : ""
                )}
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table of Contents Dropdown */}
      {tocOpen && showTableOfContents && (
        <div className={cn(
          "absolute top-full z-50",
          "right-4 mt-2 w-80 max-w-[calc(100vw-2rem)]"
        )}>
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-lg opacity-50" />
            
            {/* Table of contents content */}
            <div className={cn(
              "relative rounded-2xl shadow-lg border",
              "backdrop-blur-2xl supports-[backdrop-filter]:bg-background/95",
              "bg-background/95 border-border/50 shadow-black/20 dark:shadow-black/40",
              "p-4 max-h-96 overflow-y-auto"
            )}>
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/20 pb-2">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Contents</span>
                  </div>
                  <button
                    onClick={() => setTocOpen(false)}
                    className="p-1 hover:bg-muted/30 rounded-full transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                
                {/* Navigation list */}
                <div className="space-y-1">
                  {headings.map((heading) => {
                    const isActive = activeId === heading.id
                    const paddingLeft = (heading.level - 1) * 12
                    
                    return (
                      <button
                        key={heading.id}
                        onClick={() => {
                          scrollToHeading(heading.id)
                          setTocOpen(false)
                        }}
                        className={cn(
                          "w-full text-left text-sm leading-5",
                          "py-2 px-3 rounded-lg transition-all duration-200",
                          "hover:bg-muted/50 hover:scale-[1.02]",
                          isActive 
                            ? "text-primary bg-primary/10 font-semibold border border-primary/20 shadow-sm" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        style={{ paddingLeft: `${paddingLeft + 12}px` }}
                      >
                        <div className="flex items-center space-x-2">
                          {isActive && (
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse flex-shrink-0" />
                          )}
                          <span className="truncate">{heading.text}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
                
                {/* Footer */}
                <div className="border-t border-border/20 pt-2">
                  <div className="text-xs text-muted-foreground text-center">
                    {headings.length} section{headings.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className={cn(
          "md:hidden absolute top-full z-40",
          isScrolled 
            ? "left-4 right-4 mt-3" // Dynamic island positioning
            : "left-4 right-4 mt-2" // Full width positioning
        )}>
          <div className="relative">
            {/* Glow effect for mobile menu */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-lg opacity-50" />
            
            {/* Mobile menu content */}
            <div className={cn(
              "relative shadow-lg border transition-all duration-300",
              "backdrop-blur-2xl supports-[backdrop-filter]:bg-background/90",
              "p-4",
              isScrolled 
                ? "rounded-2xl bg-background/90 border-border/50 shadow-black/20 dark:shadow-black/40"
                : "rounded-2xl bg-background/90 border-border/50 shadow-black/20 dark:shadow-black/40"
            )}>
              <div className="space-y-2">
                {navItems.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center space-x-3",
                        "px-4 py-3 text-base font-medium rounded-xl",
                        "transition-all duration-300",
                        active
                          ? "bg-primary/10 text-primary border border-primary/20 shadow-md scale-105"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/30 hover:scale-105"
                      )}
                    >
                      <div className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        active 
                          ? "bg-primary/20" 
                          : "bg-muted/50"
                      )}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span>{item.label}</span>
                      {active && (
                        <div className="ml-auto w-2 h-2 bg-primary rounded-full animate-pulse" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}