import { getPosts } from '@/lib/noxion'
import { ArticlesFilter } from '@/components/features/blog'
import { Search } from 'lucide-react'
import { Suspense } from 'react'
import { generateArticlesMetadata } from '@/lib/metadata'
import { SearchBarSkeleton, FilterControlsSkeleton, ArticlesGridSkeleton } from '@/components/ui/skeletons'

export const metadata = generateArticlesMetadata()

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Search and Filter Controls */}
      <div className="space-y-6">
        <SearchBarSkeleton />
        <FilterControlsSkeleton />
      </div>

      {/* Results Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-6 w-40 bg-muted animate-pulse rounded"></div>
      </div>

      {/* Articles Grid Skeleton */}
      <ArticlesGridSkeleton count={6} />
    </div>
  )
}

async function ArticlesList() {
  const posts = await getPosts()

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-card border rounded-2xl p-12">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-primary/60 rounded-2xl flex items-center justify-center">
                <Search className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4">No articles found</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Ready to create your first article? Connect your Notion database to get started.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Articles with Search and Filter */}
      <ArticlesFilter posts={posts} />
    </div>
  )
}

export default function ArticlesPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        {/* Header - Mobile Optimized */}
        <div className="text-center mb-8 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
            All Articles
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Explore our complete collection of articles, tutorials, and insights
          </p>
        </div>

        {/* Articles Content */}
        <Suspense fallback={<LoadingSkeleton />}>
          <ArticlesList />
        </Suspense>
      </div>
    </main>
  )
}

