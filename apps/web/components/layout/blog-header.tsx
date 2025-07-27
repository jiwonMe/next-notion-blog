'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '../common/theme-toggle'
import { Button } from '../ui/button'
import { Menu, X, Home, FileText, ArrowLeft, List, BookOpen } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useTableOfContents } from '@/hooks/use-table-of-contents'
import { useScrollProgress } from '@/hooks/use-scroll-progress'
import type { Database } from '@/lib/supabase'

type Blog = Database['public']['Tables']['blogs']['Row']

interface BlogHeaderProps {
  blog: Blog
}

export function BlogHeader({ blog }: BlogHeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [tocOpen, setTocOpen] = useState(false)
  const { headings, activeId, scrollToHeading } = useTableOfContents()
  const { isScrolled, scrollProgress } = useScrollProgress({
    scrollThreshold: 50,
    maxScrollDistance: 200,
  })
  const tocRef = useRef<HTMLDivElement>(null)

  // Navigation items for individual blog
  const blogNavItems = [
    { href: `/${blog.slug}`, label: 'Home', icon: Home },
    { href: `/${blog.slug}/posts`, label: 'Posts', icon: FileText },
  ]

  const isActive = (href: string) => {
    if (href === `/${blog.slug}`) {
      return pathname === `/${blog.slug}`
    }
    return pathname.startsWith(href)
  }

  // Check if we're on a blog post page
  const isPostPage = pathname.includes('/posts/') && pathname.split('/').length === 4
  const showTableOfContents = isPostPage && headings.length > 0

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
      "sticky top-0 z-50 w-full transition-all duration-300",
      isScrolled 
        ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm" 
        : "bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/40"
    )}>
      <div className="container flex h-16 items-center justify-between">
        {/* Left: Blog branding */}
        <div className="flex items-center space-x-4">
          <Link href={`/${blog.slug}`} className="flex items-center space-x-3">
            {blog.logo_url ? (
              <img 
                src={blog.logo_url} 
                alt={blog.title}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {blog.title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-semibold text-lg leading-tight">{blog.title}</span>
              {blog.description && (
                <span className="text-xs text-muted-foreground leading-tight">
                  {blog.description}
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {blogNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                isActive(item.href) 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          {/* Table of Contents button */}
          {showTableOfContents && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTocOpen(!tocOpen)}
              className={cn(
                "relative",
                tocOpen ? "bg-primary/10 text-primary" : ""
              )}
            >
              <List className="h-4 w-4" />
              {activeId && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
            </Button>
          )}
          
          {/* Back to platform */}
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Platform
            </Link>
          </Button>
          
          <ThemeToggle />
          
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Table of Contents Dropdown */}
      {tocOpen && showTableOfContents && (
        <div className="absolute top-full right-4 mt-2 w-80 max-w-[calc(100vw-2rem)] z-50">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-lg opacity-50" />
            
            <div className="relative rounded-2xl shadow-lg border backdrop-blur-2xl supports-[backdrop-filter]:bg-background/95 bg-background/95 border-border/50 p-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
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
                          "w-full text-left text-sm leading-5 py-2 px-3 rounded-lg transition-all duration-200 hover:bg-muted/50",
                          isActive 
                            ? "text-primary bg-primary/10 font-semibold border border-primary/20" 
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container py-4 space-y-2">
            {blogNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 text-base font-medium rounded-md",
                  isActive(item.href) 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            
            <div className="pt-4 border-t">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 text-base font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Platform</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}