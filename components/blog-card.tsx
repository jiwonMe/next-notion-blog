import Link from 'next/link'
import Image from 'next/image'
import { Clock, Calendar, ArrowUpRight } from 'lucide-react'
import { BlogPost } from '@/types/notion'
import { formatDateShort, getReadingTimeText, truncateText, generatePreviewText } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface BlogCardProps {
  post: BlogPost
  className?: string
  variant?: 'default' | 'featured' | 'compact'
}

export function BlogCard({ post, className, variant = 'default' }: BlogCardProps) {
  // 글의 미리보기 텍스트 생성
  const getPreviewText = (post: BlogPost): string => {
    if (post.summary) {
      const baseLength = variant === 'compact' ? 80 : 120
      return truncateText(post.summary, baseLength)
    }
    
    if (post.content) {
      const baseLength = variant === 'compact' ? 100 : 140
      return generatePreviewText(post.content, baseLength)
    }
    
    return "이 글을 클릭하여 전체 내용을 확인해보세요."
  }

  const previewText = getPreviewText(post)
  
  // Consistent aspect ratios based on variant
  const getAspectRatio = () => {
    if (variant === 'featured') return 'aspect-[16/10]'
    if (variant === 'compact') return 'aspect-[4/3]'
    
    // Use consistent aspect ratio for grid layout
    return 'aspect-[4/3]'
  }

  return (
    <Card className={cn(
      // Base styles - 단순화
      "group relative overflow-hidden flex flex-col",
      "bg-card border border-border",
      "shadow-sm hover:shadow-lg",
      "transition-all duration-300 ease-out",
      "hover:-translate-y-1",
      
      // Variant styles
      variant === 'featured' && "md:col-span-2",
      variant === 'compact' && "scale-100",
      
      className
    )}>
      <Link href={`/posts/${post.slug}`} className="block flex flex-col h-full">
        {/* Cover Image or Placeholder */}
        <div className={cn(
          "relative overflow-hidden flex-shrink-0",
          getAspectRatio()
        )}>
          {post.cover ? (
            <>
              <Image
                src={post.cover}
                alt={post.title}
                fill
                className={cn(
                  "object-cover transition-transform duration-500",
                  "group-hover:scale-105"
                )}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyEnyLlNZFHdHFJ2YRnYLuSxIjfBxVGdTsHfE7PUQEhLu1nJQEQGnIKoQHJ2sNRwQJcMIvNYzFJsqQBXjJXYBCNRQhqQcVxNTFQvzFJQNHuQWGLPkKJCQbPIiNMGQSLMUlhqMAQx8NJDgIkFCpNSGHQLz0+nS5cxrYg3VfgmxVsNxWEcIVIkFhHN5EyOQVcUGQqLYbGSDIyTWAAVJhRFmNMIbGbdKYEIqCBEJRSAAhbwfMRvIXCvAEWoEuJQCRAFJJBFABqBqOiD4qBIEFYCqKAjOgAwKMGBLNiGLKGFgYPAVMGQWpHaAAVFCbKvQk2NhPJ2TRZgEDUYn2CjSzLSAEU9MBOGgAIwEEAkEEAAKEAR0XMSfGRiIBEtlXUWBBYCkWVJgIBTBhUjUt0QJgIJBJOSYGjBIQSGAmhgMCSGEwAKByQa2BdXKGAIBFhGCNTKxRAcCCKCAaB0hXLRXJGLRoJGwQlVMIQEEFyqEEAEFhCKBEGCJyIBZkVAaYLGKGBMRNQhcjIgJnFACwGAMGBOOAyKEgAJJIAD//2Q=="
              />
              {/* 간단한 gradient overlay */}
              <div className={cn(
                "absolute inset-0",
                "bg-gradient-to-t from-black/20 to-transparent",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              )} />
            </>
          ) : (
            /* Placeholder for posts without cover image */
            <div className={cn(
              "w-full h-full flex items-center justify-center",
              "bg-gradient-to-br from-muted via-muted/50 to-muted",
              "group-hover:from-muted/80 group-hover:via-muted/30 group-hover:to-muted/80",
              "transition-all duration-500"
            )}>
              <div className="text-center p-6">
                <div className={cn(
                  "w-12 h-12 mx-auto mb-3 rounded-full",
                  "bg-primary/10 flex items-center justify-center",
                  "group-hover:bg-primary/20 transition-colors duration-300"
                )}>
                  <ArrowUpRight className="h-6 w-6 text-primary/60" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  {post.tags[0] || 'Article'}
                </p>
              </div>
            </div>
          )}
        </div>
        
        <CardContent className={cn(
          "p-5 space-y-4 flex-1 flex flex-col",
          variant === 'compact' && "p-4 space-y-3"
        )}>
          
          {/* Tags Section - 단순화 */}
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, variant === 'compact' ? 2 : 3).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className={cn(
                  "text-xs px-2 py-1",
                  "bg-primary/10 text-primary border-primary/20",
                  "hover:bg-primary/20 transition-colors"
                )}
              >
                {tag}
              </Badge>
            ))}
            {post.tags.length > (variant === 'compact' ? 2 : 3) && (
              <Badge variant="outline" className="text-xs opacity-70">
                +{post.tags.length - (variant === 'compact' ? 2 : 3)}
              </Badge>
            )}
          </div>
          
          {/* Title and Preview */}
          <div className="space-y-3 flex-1">
            <h3 className={cn(
              "font-bold leading-tight",
              "group-hover:text-primary transition-colors duration-200",
              "line-clamp-2",
              variant === 'featured' ? "text-xl" : "text-lg",
              variant === 'compact' && "text-base"
            )}>
              {post.title}
            </h3>
            
            {/* Preview text */}
            <p className={cn(
              "text-muted-foreground leading-relaxed text-sm",
              variant === 'compact' ? "line-clamp-2" : "line-clamp-3",
              !post.summary && !post.content && "italic opacity-75"
            )}>
              {previewText}
            </p>
          </div>
          
          {/* Metadata - 단순화 */}
          <div className={cn(
            "flex items-center justify-between pt-3",
            "border-t border-border/50"
          )}>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                <time dateTime={post.date}>
                  {formatDateShort(post.date)}
                </time>
              </div>
              
              {post.readingTime && variant !== 'compact' && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  <span>{getReadingTimeText(post.readingTime)}</span>
                </div>
              )}
            </div>
            
            {/* 간단한 read more indicator */}
            <div className={cn(
              "flex items-center gap-1 text-primary text-sm",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            )}>
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}