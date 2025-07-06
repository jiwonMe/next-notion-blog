import { getPageBySlug, getAllSlugs } from '@/lib/notion'
import { MarkdownContent } from '@/components/markdown-content'
import { formatDate, getReadingTimeText } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { generateMetadata as generateMeta } from '@/lib/utils'

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const post = await getPageBySlug(params.slug)
  
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested post could not be found.',
    }
  }

  return generateMeta(
    post.title,
    post.summary || `Read ${post.title} on Noxion`,
    post.cover,
    `/posts/${post.slug}`
  )
}

export default async function PostPage({ params }: PageProps) {
  const post = await getPageBySlug(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <nav className="py-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to posts
          </Link>
        </nav>

        {/* Article */}
        <article className="pb-16">
          {/* Header */}
          <header className="mb-12">
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="inline-block px-3 py-1 text-xs font-medium text-muted-foreground bg-muted rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Summary */}
            {post.summary && (
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {post.summary}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <time dateTime={post.date} className="flex items-center">
                {formatDate(post.date)}
              </time>
              {post.readingTime && (
                <span className="flex items-center">
                  {getReadingTimeText(post.readingTime)}
                </span>
              )}
            </div>
          </header>

          {/* Cover Image */}
          {post.cover && (
            <div className="mb-12">
              <Image
                src={post.cover}
                alt={post.title}
                width={1200}
                height={630}
                className="w-full h-auto rounded-lg"
                priority
              />
            </div>
          )}

          {/* Content */}
          {post.content && (
            <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
              <MarkdownContent content={post.content} />
            </div>
          )}
        </article>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Last updated on {formatDate(post.lastEditedTime)}
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← All posts
            </Link>
          </div>
        </footer>
      </div>
    </main>
  )
}

export const revalidate = 3600