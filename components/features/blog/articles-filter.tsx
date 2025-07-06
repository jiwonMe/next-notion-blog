'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { BlogCard } from './blog-card'
import { BlogPost } from '@/types/notion'
import { ArticleSearch } from '../search/article-search'
import { Search, Filter, X, Grid, List, Calendar, Hash, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ArticlesFilterProps {
  posts: BlogPost[]
}

export function ArticlesFilter({ posts }: ArticlesFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'popularity'>('date')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Set mobile default to list view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setViewMode('list')
      } else {
        setViewMode('grid')
      }
    }

    // Set initial view mode
    handleResize()

    // Add event listener for window resize
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)

  // Get all unique tags with counts
  const allTags = useMemo(() => {
    const tagCounts = new Map<string, number>()
    posts.forEach(post => {
      post.tags?.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    })
    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by popularity
      .map(([tag]) => tag)
  }, [posts])

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let filtered = posts

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by selected tag
    if (selectedTag) {
      filtered = filtered.filter(post => post.tags?.includes(selectedTag))
    }

    // Sort posts
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortBy === 'popularity') {
      // Sort by tag popularity (posts with more popular tags first)
      filtered.sort((a, b) => {
        const aPopularity = a.tags?.reduce((sum, tag) => {
          const tagIndex = allTags.indexOf(tag)
          return sum + (tagIndex === -1 ? 0 : allTags.length - tagIndex)
        }, 0) || 0
        const bPopularity = b.tags?.reduce((sum, tag) => {
          const tagIndex = allTags.indexOf(tag)
          return sum + (tagIndex === -1 ? 0 : allTags.length - tagIndex)
        }, 0) || 0
        return bPopularity - aPopularity
      })
    }

    return filtered
  }, [posts, searchTerm, selectedTag, sortBy, allTags])

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setSelectedTag(null)
    setSortBy('date')
  }, [])

  const handlePostSelect = useCallback((post: BlogPost) => {
    setSelectedPost(post)
    // Navigate to post page
    window.location.href = `/articles/${post.slug}`
  }, [])

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  const handleTagSelect = useCallback((tag: string | null) => {
    setSelectedTag(tag)
  }, [])

  const activeFiltersCount = (searchTerm ? 1 : 0) + (selectedTag ? 1 : 0) + (sortBy !== 'date' ? 1 : 0)

  return (
    <div className="space-y-8">
      {/* Enhanced Search with Command Component */}
      <div className="space-y-6">
        <ArticleSearch
          posts={posts}
          onSelectPost={handlePostSelect}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          selectedTag={selectedTag}
          onTagSelect={handleTagSelect}
        />

        {/* Advanced Filter Controls - Mobile Optimized */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
          {/* Mobile: Stack controls vertically */}
          <div className="block sm:hidden space-y-4">
            {/* Top Row: Sort and View Mode */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'popularity')}
                  className="flex-1 px-2 py-1.5 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                >
                  <option value="date">Latest First</option>
                  <option value="title">A-Z</option>
                  <option value="popularity">Popular Tags</option>
                </select>
              </div>
              
              {/* View Mode Toggle - Mobile */}
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none border-r h-8 px-2"
                >
                  <Grid className="h-3 w-3" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none h-8 px-2"
                >
                  <List className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Mobile Quick Filters */}
            {allTags.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Quick filters:</span>
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                  <Button
                    variant={!selectedTag ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTag(null)}
                    className="whitespace-nowrap text-xs h-7 px-2 flex-shrink-0"
                  >
                    All
                  </Button>
                  {allTags.slice(0, 6).map((tag) => {
                    const isSelected = selectedTag === tag
                    const tagCount = posts.filter(p => p.tags?.includes(tag)).length
                    return (
                      <Button
                        key={tag}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTag(isSelected ? null : tag)}
                        className="whitespace-nowrap text-xs h-7 px-2 flex-shrink-0"
                      >
                        <Hash className="h-3 w-3 mr-1" />
                        {tag}
                        <span className="ml-1 text-xs opacity-70">({tagCount})</span>
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Clear Filters - Mobile */}
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full h-8"
              >
                <X className="h-3 w-3 mr-2" />
                Clear All Filters ({activeFiltersCount})
              </Button>
            )}
          </div>

          {/* Desktop: Horizontal layout */}
          <div className="hidden sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'popularity')}
                  className="px-3 py-1.5 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                >
                  <option value="date">Latest First</option>
                  <option value="title">A-Z</option>
                  <option value="popularity">Popular Tags</option>
                </select>
              </div>

              {/* Quick Tag Filters */}
              {allTags.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Quick filters:</span>
                  <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide max-w-md">
                    {allTags.slice(0, 5).map((tag) => {
                      const isSelected = selectedTag === tag
                      const tagCount = posts.filter(p => p.tags?.includes(tag)).length
                      return (
                        <Button
                          key={tag}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTag(isSelected ? null : tag)}
                          className="whitespace-nowrap text-xs h-7 px-2"
                        >
                          <Hash className="h-3 w-3 mr-1" />
                          {tag}
                          <span className="ml-1 text-xs opacity-70">({tagCount})</span>
                        </Button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none border-r h-8 px-2"
                >
                  <Grid className="h-3 w-3" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none h-8 px-2"
                >
                  <List className="h-3 w-3" />
                </Button>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 px-3"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear ({activeFiltersCount})
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">
              {filteredPosts.length === posts.length 
                ? `All Articles (${posts.length})`
                : `Filtered Results (${filteredPosts.length} of ${posts.length})`}
            </h3>
            {selectedTag && (
              <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-full">
                <Hash className="h-3 w-3" />
                <span>{selectedTag}</span>
              </div>
            )}
          </div>
          {filteredPosts.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>
                {sortBy === 'date' ? 'Latest first' : 
                 sortBy === 'title' ? 'Alphabetical' : 
                 'By popularity'}
              </span>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl blur-xl"></div>
              <div className="relative bg-card border rounded-2xl p-12 max-w-md mx-auto">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-2xl flex items-center justify-center">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm ? `No results for "${searchTerm}"` : 'No articles match your filters'}
                </p>
                <Button onClick={clearFilters} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Article Grid/List - Mobile Optimized */
          <div className={cn(
            "transition-all duration-300",
            viewMode === 'grid' 
              ? "grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
              : "space-y-4"
          )}>
            {filteredPosts.map((post, index) => (
              <div 
                key={post.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <BlogCard 
                  post={post} 
                  viewMode={viewMode}
                  onTagSelect={handleTagSelect}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}