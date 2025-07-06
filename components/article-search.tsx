'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { BlogPost } from '@/types/notion'
import { Search, Hash, Calendar, Clock, ArrowRight, Command as CommandIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'

interface ArticleSearchProps {
  posts: BlogPost[]
  onSelectPost: (post: BlogPost) => void
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedTag?: string | null
  onTagSelect: (tag: string | null) => void
}

export function ArticleSearch({ 
  posts, 
  onSelectPost, 
  searchTerm, 
  onSearchChange,
  selectedTag,
  onTagSelect 
}: ArticleSearchProps) {
  const [open, setOpen] = useState(false)
  const [commandValue, setCommandValue] = useState('')

  // Get all unique tags
  const allTags = useMemo(() => {
    if (!posts || posts.length === 0) return []
    return Array.from(new Set(posts.flatMap(post => post.tags || []))).sort()
  }, [posts])

  // Search suggestions based on current input
  const searchSuggestions = useMemo(() => {
    if (!commandValue || !posts || posts.length === 0) {
      return { titleMatches: [], tagMatches: [], contentMatches: [] }
    }
    
    // Title matches
    const titleMatches = posts.filter(post =>
      post.title?.toLowerCase().includes(commandValue.toLowerCase())
    ).slice(0, 5)
    
    // Tag matches
    const tagMatches = allTags.filter(tag =>
      tag.toLowerCase().includes(commandValue.toLowerCase())
    ).slice(0, 3)
    
    // Content matches (summary)
    const contentMatches = posts.filter(post =>
      post.summary?.toLowerCase().includes(commandValue.toLowerCase()) &&
      !titleMatches.includes(post)
    ).slice(0, 3)
    
    return { titleMatches, tagMatches, contentMatches }
  }, [commandValue, posts, allTags])

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setCommandValue(value)
    onSearchChange(value)
  }, [onSearchChange])

  // Handle post selection
  const handlePostSelect = useCallback((post: BlogPost) => {
    onSelectPost(post)
    setOpen(false)
    setCommandValue('')
  }, [onSelectPost])

  // Handle tag selection
  const handleTagSelect = useCallback((tag: string) => {
    onTagSelect(selectedTag === tag ? null : tag)
    setOpen(false)
  }, [onTagSelect, selectedTag])

  // Quick search trigger
  const triggerSearch = () => {
    setOpen(true)
  }

  return (
    <>
      {/* Search Trigger Button */}
      <div className="relative max-w-2xl mx-auto">
        <Button
          variant="outline"
          onClick={triggerSearch}
          className={cn(
            "w-full justify-between h-12 px-4 py-2",
            "text-muted-foreground hover:text-foreground",
            "border-border hover:border-ring",
            "transition-colors"
          )}
        >
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4" />
            <span className="text-base">
              {searchTerm || 'Search articles...'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <CommandIcon className="h-3 w-3" />
            <span>K</span>
          </div>
        </Button>
        
        {/* Selected tag indicator */}
        {selectedTag && (
          <div className="absolute -bottom-8 left-0 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filtered by:</span>
            <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              <Hash className="h-3 w-3" />
              <span>{selectedTag}</span>
              <button
                onClick={() => onTagSelect(null)}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search articles, tags, or content..."
            value={commandValue}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 py-8">
                <Search className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No articles found.</p>
                <p className="text-xs text-muted-foreground">
                  Try searching for a different term.
                </p>
              </div>
            </CommandEmpty>
            
            {/* Quick Actions */}
            {!commandValue && (
              <CommandGroup heading="Quick Actions">
                <CommandItem onSelect={() => onTagSelect(null)}>
                  <Search className="mr-2 h-4 w-4" />
                  <span>Show all articles</span>
                  <CommandShortcut>{posts?.length || 0} total</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => handleSearchChange('recent')}>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Recent articles</span>
                </CommandItem>
                <CommandItem onSelect={() => handleSearchChange('tutorial')}>
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Search tutorials</span>
                </CommandItem>
              </CommandGroup>
            )}

            {/* Article Results */}
            {searchSuggestions.titleMatches?.length > 0 && (
              <CommandGroup heading="Articles">
                {searchSuggestions.titleMatches.map((post) => (
                  <CommandItem
                    key={post.id}
                    onSelect={() => handlePostSelect(post)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-shrink-0">
                        {post.cover ? (
                          <img
                            src={post.cover}
                            alt=""
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                            <Search className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{post.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {post.summary || 'No description'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(post.date).toLocaleDateString()}</span>
                        </div>
                        {post.readingTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{post.readingTime}m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Tag Results */}
            {searchSuggestions.tagMatches?.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Tags">
                  {searchSuggestions.tagMatches.map((tag) => (
                    <CommandItem
                      key={tag}
                      onSelect={() => handleTagSelect(tag)}
                      className="cursor-pointer"
                    >
                      <Hash className="mr-2 h-4 w-4" />
                      <span>{tag}</span>
                      <CommandShortcut>
                        {posts?.filter(p => p.tags?.includes(tag)).length || 0} articles
                      </CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* Content Results */}
            {searchSuggestions.contentMatches?.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Content Matches">
                  {searchSuggestions.contentMatches.map((post) => (
                    <CommandItem
                      key={`content-${post.id}`}
                      onSelect={() => handlePostSelect(post)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{post.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            Found in content: {post.summary}
                          </p>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* Popular Tags (when no search) */}
            {!commandValue && allTags.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Popular Tags">
                  {allTags.slice(0, 6).map((tag) => {
                    const tagCount = posts?.filter(p => p.tags?.includes(tag)).length || 0
                    return (
                      <CommandItem
                        key={tag}
                        onSelect={() => handleTagSelect(tag)}
                        className="cursor-pointer"
                      >
                        <Hash className="mr-2 h-4 w-4" />
                        <span>{tag}</span>
                        <CommandShortcut>{tagCount}</CommandShortcut>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}