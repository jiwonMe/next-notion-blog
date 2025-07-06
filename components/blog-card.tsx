import Link from 'next/link'
import Image from 'next/image'
import { Clock, Calendar, ArrowUpRight } from 'lucide-react'
import { BlogPost } from '@/types/notion'
import { formatDateShort, getReadingTimeText, truncateText, generatePreviewText } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface BlogCardProps {
  post: BlogPost
}

export function BlogCard({ post }: BlogCardProps) {
  // 글의 미리보기 텍스트 생성
  const getPreviewText = (post: BlogPost): string => {
    if (post.summary) {
      // summary가 있으면 적절한 길이로 자르기
      return truncateText(post.summary, 120)
    }
    
    if (post.content) {
      // summary가 없으면 본문 content에서 미리보기 생성
      return generatePreviewText(post.content, 120)
    }
    
    // summary와 content 모두 없으면 기본 텍스트 반환
    return "이 글을 클릭하여 전체 내용을 확인해보세요."
  }

  const previewText = getPreviewText(post)

  return (
    <Card className={`
      group overflow-hidden border-0 shadow-card transition-all duration-500 
      hover:bg-primary/5 border-neutral-50 hover:shadow-lg hover:-translate-y-1
    `}>
      <Link href={`/posts/${post.slug}`} className="block">
        {post.cover && (
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={post.cover}
              alt={post.title}
              width={400}
              height={300}
              className={`
                h-full w-full object-cover transition-all duration-700 
                group-hover:scale-110
              `}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyEnyLlNZFHdHFJ2YRnYLuSxIjfBxVGdTsHfE7PUQEhLu1nJQEQGnIKoQHJ2sNRwQJcMIvNYzFJsqQBXjJXYBCNRQhqQcVxNTFQvzFJQNHuQWGLPkKJCQbPIiNMGQSLMUlhqMAQx8NJDgIkFCpNSGHQLz0+nS5cxrYg3VfgmxVsNxWEcIVIkFhHN5EyOQVcUGQqLYbGSDIyTWAAVJhRFmNMIbGbdKYEIqCBEJRSAAhbwfMRvIXCvAEWoEuJQCRAFJJBFABqBqOiD4qBIEFYCqKAjOgAwKMGBLNiGLKGFgYPAVMGQWpHaAAVFCbKvQk2NhPJ2TRZgEDUYn2CjSzLSAEU9MBOGgAIwEEAkEEAAKEAR0XMSfGRiIBEtlXUWBBYCkWVJgIBTBhUjUt0QJgIJBJOSYGjBIQSGAmhgMCSGEwAKByQa2BdXKGAIBFhGCNTKxRAcCCKCAaB0hXLRXJGLRoJGwQlVMIQEEFyqEEAEFhCKBEGCJyIBZkVAaYLGKGBMRNQhcjIgJnFACwGAMGBOOAyKEgAJJIAD//2Q=="
            />
            <div className={`
              absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent 
              opacity-0 group-hover:opacity-100 transition-opacity duration-300
            `}></div>
            <div className={`
              absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 
              transform translate-x-2 group-hover:translate-x-0
            `}>
              <div className="bg-background/90 backdrop-blur-sm rounded-full p-2">
                <ArrowUpRight className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>
        )}
        
        <CardContent className="p-6 space-y-4">
          {/* 태그 섹션 */}
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 2).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className={`
                  text-xs font-medium bg-primary/10 text-primary border-primary/20 
                  hover:bg-primary/20 transition-colors
                `}
              >
                {tag}
              </Badge>
            ))}
            {post.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{post.tags.length - 2}
              </Badge>
            )}
          </div>
          
          {/* 제목과 미리보기 텍스트 */}
          <div className="space-y-3">
            <h3 className={`
              text-xl font-bold leading-tight line-clamp-2 
              group-hover:text-primary transition-colors duration-300
            `}>
              {post.title}
            </h3>
            
            {/* 글의 미리보기 텍스트 - 항상 표시 */}
            <div className="min-h-[4.5rem] flex items-start">
              <p className={`
                text-muted-foreground line-clamp-3 leading-relaxed text-sm
                ${!post.summary && !post.content ? 'italic opacity-75' : ''}
              `}>
                {previewText}
              </p>
            </div>
          </div>
          
          {/* 메타데이터 */}
          <div className={`
            flex items-center justify-between pt-2 border-t border-border/50
          `}>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <time dateTime={post.date}>
                  {formatDateShort(post.date)}
                </time>
              </div>
              {post.readingTime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{getReadingTimeText(post.readingTime)}</span>
                </div>
              )}
            </div>
            
            <div className={`
              text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300
            `}>
              <span className="text-sm font-medium">더 읽기</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}