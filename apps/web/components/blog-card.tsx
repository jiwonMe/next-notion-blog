'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, Tag } from 'lucide-react'
import { format } from 'date-fns'

interface BlogPost {
  id: string
  title: string
  slug: string
  summary: string | null
  cover_url: string | null
  tags: string[]
  published_at: string | null
  created_at: string
}

interface BlogCardProps {
  post: BlogPost
  href: string
}

export function BlogCard({ post, href }: BlogCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      {post.cover_url && (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={post.cover_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <CardHeader>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <time dateTime={post.published_at || post.created_at}>
              {format(new Date(post.published_at || post.created_at), 'MMM d, yyyy')}
            </time>
          </div>
          
          <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
            <Link href={href}>
              {post.title}
            </Link>
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {post.summary && (
            <CardDescription className="line-clamp-3">
              {post.summary}
            </CardDescription>
          )}
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-3 w-3 text-muted-foreground" />
              <div className="flex gap-1 flex-wrap">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
                {post.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{post.tags.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}