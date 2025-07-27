'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, ArrowRight, Clock, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

interface QuickSearchProps {
  className?: string
}

const mockSearchResults = [
  { type: 'page', title: 'Getting Started', href: '/docs/getting-started', icon: ArrowRight },
  { type: 'article', title: 'Building Multi-tenant Apps', href: '/articles/multi-tenant', icon: Hash },
  { type: 'recent', title: 'Dashboard Overview', href: '/dashboard', icon: Clock },
]

export function QuickSearch({ className }: QuickSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(mockSearchResults)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredResults = results.filter(result =>
    result.title.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className={cn("relative", className)} ref={searchRef}>
      {/* Search trigger button */}
      <Button
        variant="outline"
        size="sm"
        className="group w-64 justify-start text-muted-foreground hover:text-foreground"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-4 w-4 mr-2" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Search modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl mx-4 glass-strong rounded-xl shadow-2xl animate-scale-in">
            {/* Search input */}
            <div className="flex items-center border-b border-border/50 p-4">
              <Search className="h-5 w-5 text-muted-foreground mr-3" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search documentation, articles, and more..."
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-1 h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search results */}
            <div className="max-h-96 overflow-y-auto">
              {filteredResults.length > 0 ? (
                <div className="p-2">
                  {filteredResults.map((result, index) => (
                    <a
                      key={index}
                      href={result.href}
                      className="group flex items-center p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      <result.icon className="h-4 w-4 text-muted-foreground mr-3 group-hover:text-foreground transition-colors" />
                      <div className="flex-1">
                        <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {result.title}
                        </div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {result.type}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No results found for "{query}"</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border/50 p-3 text-xs text-muted-foreground flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <kbd className="px-1.5 py-0.5 text-[10px] border rounded">↑</kbd>
                  <kbd className="px-1.5 py-0.5 text-[10px] border rounded">↓</kbd>
                  <span>to navigate</span>
                </div>
                <div className="flex items-center space-x-1">
                  <kbd className="px-1.5 py-0.5 text-[10px] border rounded">↵</kbd>
                  <span>to select</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <kbd className="px-1.5 py-0.5 text-[10px] border rounded">esc</kbd>
                <span>to close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}