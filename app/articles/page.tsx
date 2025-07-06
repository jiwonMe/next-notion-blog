import { getDatabasePages } from '@/lib/notion'
import { ArticlesFilter } from '@/components/articles-filter'
import { Search } from 'lucide-react'
import { Suspense } from 'react'
import { generateOGImageUrl, getBaseUrl } from '@/lib/og-image'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Articles | Noxion Blog',
  description: 'Browse all articles and blog posts from our Notion-powered blog. Discover insights, tutorials, and stories.',
  keywords: ['articles', 'blog posts', 'tutorials', 'insights'],
  authors: [{ name: 'Noxion' }],
  openGraph: {
    title: 'All Articles | Noxion Blog',
    description: 'Browse all articles and blog posts from our Notion-powered blog. Discover insights, tutorials, and stories.',
    type: 'website',
    images: [
      {
        url: generateOGImageUrl({
          title: 'All Articles',
          description: 'Browse all articles and blog posts from our Notion-powered blog',
          type: 'homepage'
        }, getBaseUrl()),
        width: 1200,
        height: 630,
        alt: 'All Articles - Noxion Blog',
      },
    ],
    url: `${getBaseUrl()}/articles`,
    siteName: 'Noxion Blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Articles | Noxion Blog',
    description: 'Browse all articles and blog posts from our Notion-powered blog. Discover insights, tutorials, and stories.',
    images: [generateOGImageUrl({
      title: 'All Articles',
      description: 'Browse all articles and blog posts from our Notion-powered blog',
      type: 'homepage'
    }, getBaseUrl())],
  },
  alternates: {
    canonical: `${getBaseUrl()}/articles`,
  },
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Search Bar Skeleton */}
      <div className="space-y-6">
        <div className="max-w-2xl mx-auto">
          <div className="h-14 skeleton-shimmer rounded-xl"></div>
        </div>
        
        {/* Filter Controls Skeleton */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="h-8 w-24 skeleton-shimmer rounded-lg"></div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-12 skeleton-shimmer rounded"></div>
            <div className="flex gap-2">
              <div className="h-6 w-8 skeleton-shimmer rounded-full"></div>
              <div className="h-6 w-12 skeleton-shimmer rounded-full"></div>
              <div className="h-6 w-16 skeleton-shimmer rounded-full"></div>
              <div className="h-6 w-10 skeleton-shimmer rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-6 w-40 skeleton-shimmer rounded"></div>
      </div>

      {/* Articles Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div 
            key={i} 
            className="bg-card border rounded-lg overflow-hidden"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="aspect-[4/3] skeleton-shimmer"></div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <div className="h-4 w-16 skeleton-shimmer rounded-full"></div>
                <div className="h-4 w-20 skeleton-shimmer rounded-full"></div>
              </div>
              <div className="space-y-3">
                <div className="h-6 w-3/4 skeleton-shimmer rounded"></div>
                <div className="h-4 w-full skeleton-shimmer rounded"></div>
                <div className="h-4 w-5/6 skeleton-shimmer rounded"></div>
              </div>
              <div className="flex gap-4 pt-2">
                <div className="h-4 w-24 skeleton-shimmer rounded"></div>
                <div className="h-4 w-20 skeleton-shimmer rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

async function ArticlesList() {
  const posts = await getDatabasePages()

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            All Articles
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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

