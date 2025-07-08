import { getPost } from '@/lib/noxion'
import { MarkdownContent } from '@noxion/core'
import { ArticleSidebar } from '@/components/features/article'
import { ClientCommentsSection } from '@/components/comments-wrapper'
import { formatDate, getReadingTimeText } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { generatePostMetadata, generateErrorMetadata } from '@/lib/metadata'

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const { getAllSlugs } = await import('@/lib/noxion')
  const slugs = await getAllSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const post = await getPost(params.slug)
  
  if (!post) {
    return generateErrorMetadata('not-found')
  }

  return generatePostMetadata(post)
}

export default async function PostPage({ params }: PageProps) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  // Comments will be handled by ClientCommentsSection component

  return (
    <main className={cn(
      // Layout
      "min-h-screen bg-background"
    )}>
      <div className={cn(
        // Container
        "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      )}>
        {/* Navigation */}
        <nav className={cn(
          // Spacing
          "py-8"
        )}>
          <Link 
            href="/articles" 
            className={cn(
              // Layout
              "inline-flex items-center",
              // Typography
              "text-sm",
              // Colors
              "text-muted-foreground hover:text-foreground",
              // Animations
              "transition-colors"
            )}
          >
            ← Back to articles
          </Link>
        </nav>

        <div className={cn(
          // Grid Layout
          "grid grid-cols-1 xl:grid-cols-4 gap-8"
        )}>
          {/* Main Content */}
          <div className={cn(
            // Grid Layout
            "xl:col-span-3"
          )}>
            {/* Article */}
            <article className={cn(
              // Spacing
              "pb-16"
            )}>
              {/* Header */}
              <header className={cn(
                // Spacing
                "mb-12"
              )}>
                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className={cn(
                    // Layout
                    "flex flex-wrap gap-2",
                    // Spacing
                    "mb-6"
                  )}>
                    {post.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className={cn(
                          // Layout
                          "inline-block",
                          // Spacing
                          "px-3 py-1",
                          // Typography
                          "text-xs font-medium",
                          // Colors
                          "text-muted-foreground bg-muted",
                          // Border
                          "rounded-full"
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h1 className={cn(
                  // Typography - Mobile에서 더 작게, 데스크탑에서 크게
                  "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight",
                  // Colors
                  "text-foreground",
                  // Spacing
                  "mb-6",
                  // Line height
                  "leading-tight"
                )}>
                  {post.title}
                </h1>

                {/* Summary */}
                {post.summary && (
                  <p className={cn(
                    // Typography - Mobile에서 더 작게
                    "text-base sm:text-lg md:text-xl",
                    // Colors
                    "text-muted-foreground",
                    // Spacing
                    "mb-8",
                    // Line height
                    "leading-relaxed"
                  )}>
                    {post.summary}
                  </p>
                )}

                {/* Meta */}
                <div className={cn(
                  // Layout
                  "flex flex-wrap items-center gap-4",
                  // Typography
                  "text-sm",
                  // Colors
                  "text-muted-foreground"
                )}>
                  <time dateTime={post.date} className={cn(
                    // Layout
                    "flex items-center"
                  )}>
                    {formatDate(post.date)}
                  </time>
                  {post.readingTime && (
                    <span className={cn(
                      // Layout
                      "flex items-center"
                    )}>
                      {getReadingTimeText(post.readingTime)}
                    </span>
                  )}
                </div>
              </header>

              {/* Cover Image */}
              {post.cover && (
                <div className={cn(
                  // Spacing
                  "mb-12"
                )}>
                  <Image
                    src={post.cover}
                    alt={post.title}
                    width={1200}
                    height={630}
                    className={cn(
                      // Layout
                      "w-full h-auto",
                      // Border
                      "rounded-lg"
                    )}
                    priority
                  />
                </div>
              )}

              {/* Content */}
              {post.content && (
                <div className={cn(
                  // Typography - Mobile에서 기본 크기, 데스크탑에서 약간 크게
                  "prose sm:prose-lg prose-neutral dark:prose-invert max-w-none"
                )}>
                  <MarkdownContent content={post.content} />
                </div>
              )}
            </article>

            {/* Comments Section */}
            {process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && (
              <div className={cn("mt-16")}>
                <ClientCommentsSection 
                  postSlug={post.slug}
                  supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL}
                  supabaseKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}
                />
              </div>
            )}

            {/* Footer */}
            <footer className={cn(
              // Border
              "border-t border-border",
              // Spacing
              "py-8 mt-16"
            )}>
              <div className={cn(
                // Layout
                "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              )}>
                <p className={cn(
                  // Typography
                  "text-sm",
                  // Colors
                  "text-muted-foreground"
                )}>
                  Last updated on {formatDate(post.lastEditedTime)}
                </p>
                <Link 
                  href="/articles" 
                  className={cn(
                    // Layout
                    "inline-flex items-center",
                    // Typography
                    "text-sm",
                    // Colors
                    "text-muted-foreground hover:text-foreground",
                    // Animations
                    "transition-colors"
                  )}
                >
                  ← All articles
                </Link>
              </div>
            </footer>
          </div>

          {/* Sidebar */}
          <div className={cn(
            // Grid Layout
            "xl:col-span-1"
          )}>
            <div className={cn(
              // Position
              "xl:sticky xl:top-24"
            )}>
              <ArticleSidebar post={post} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export const revalidate = 3600