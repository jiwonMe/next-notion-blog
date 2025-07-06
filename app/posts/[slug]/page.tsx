import { getPageBySlug, getAllSlugs } from '@/lib/notion'
import { MarkdownContent } from '@/components/markdown-content'
import { formatDate, getReadingTimeText } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { generateMetadata as generateMeta } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

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
    <article className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-8">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to posts
          </Link>
        </Button>
      </div>

      <header className="mb-12">
        <div className="mb-6 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        <h1 className="mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
          {post.title}
        </h1>

        {post.summary && (
          <p className="mb-8 text-xl text-muted-foreground lg:text-2xl">
            {post.summary}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <time dateTime={post.date}>
              {formatDate(post.date)}
            </time>
          </div>
          {post.readingTime && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{getReadingTimeText(post.readingTime)}</span>
            </div>
          )}
        </div>
      </header>

      {post.cover && (
        <div className="mb-12 overflow-hidden rounded-xl border">
          <Image
            src={post.cover}
            alt={post.title}
            width={800}
            height={450}
            className="aspect-video w-full object-cover"
            priority
          />
        </div>
      )}

      {post.content && (
        <div className="mb-12">
          <MarkdownContent content={post.content} />
        </div>
      )}

      <Separator className="mb-8" />

      <footer className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Last updated: {formatDate(post.lastEditedTime)}
        </div>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All posts
          </Link>
        </Button>
      </footer>
    </article>
  )
}

export const revalidate = 3600