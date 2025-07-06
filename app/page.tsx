import { getDatabasePages } from '@/lib/notion'
import { BlogCard } from '@/components/blog-card'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'
import { ArrowRight, Sparkles, Zap, Palette, Clock, Calendar, Github, Twitter, Linkedin, Mail, User, Users, Coffee, Code, BookOpen } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { generateHomepageOGImageUrl, getBaseUrl } from '@/lib/og-image'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Noxion Blog - Write in Notion, Publish Beautifully',
  description: 'Transform your Notion pages into a stunning blog. Share your thoughts, stories, and insights with the world.',
  keywords: ['notion', 'blog', 'writing', 'publishing', 'nextjs'],
  authors: [{ name: 'Noxion' }],
  openGraph: {
    title: 'Noxion Blog - Write in Notion, Publish Beautifully',
    description: 'Transform your Notion pages into a stunning blog. Share your thoughts, stories, and insights with the world.',
    type: 'website',
    images: [
      {
        url: generateHomepageOGImageUrl(getBaseUrl()),
        width: 1200,
        height: 630,
        alt: 'Noxion Blog',
      },
    ],
    url: getBaseUrl(),
    siteName: 'Noxion Blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Noxion Blog - Write in Notion, Publish Beautifully',
    description: 'Transform your Notion pages into a stunning blog. Share your thoughts, stories, and insights with the world.',
    images: [generateHomepageOGImageUrl(getBaseUrl())],
  },
  alternates: {
    canonical: getBaseUrl(),
  },
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden shadow-card">
          <div className="aspect-[4/3] animate-pulse bg-muted"></div>
          <div className="p-6 space-y-4">
            <div className="flex gap-2">
              <div className="h-5 w-16 animate-pulse rounded-full bg-muted"></div>
              <div className="h-5 w-20 animate-pulse rounded-full bg-muted"></div>
            </div>
            <div className="space-y-2">
              <div className="h-6 w-3/4 animate-pulse rounded bg-muted"></div>
              <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted"></div>
            </div>
            <div className="flex gap-4 pt-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
              <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function HeroSkeleton() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-6">
              <div className="h-8 w-32 bg-muted rounded-full animate-pulse"></div>
              <div className="space-y-4">
                <div className="h-16 w-full bg-muted rounded animate-pulse"></div>
                <div className="h-16 w-4/5 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-6 w-full bg-muted rounded animate-pulse"></div>
                <div className="h-6 w-3/4 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="flex gap-4">
                <div className="h-12 w-32 bg-muted rounded animate-pulse"></div>
                <div className="h-12 w-24 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="bg-muted rounded-2xl p-6 animate-pulse">
              <div className="aspect-[16/10] bg-muted-foreground/20 rounded-lg mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 w-1/3 bg-muted-foreground/20 rounded"></div>
                <div className="h-6 w-full bg-muted-foreground/20 rounded"></div>
                <div className="h-4 w-5/6 bg-muted-foreground/20 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TopicsSkeleton() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="h-10 w-64 bg-muted rounded mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 w-96 bg-muted rounded mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-6 bg-muted rounded-xl animate-pulse">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-muted-foreground/20 rounded-full"></div>
                <div className="h-4 w-16 bg-muted-foreground/20 rounded mx-auto"></div>
                <div className="h-3 w-12 bg-muted-foreground/20 rounded mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

async function BlogPosts() {
  const posts = await getDatabasePages()

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-card border rounded-2xl p-12 shadow-card">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-primary/60 rounded-2xl flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4 gradient-text">No posts found</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Ready to create your first masterpiece? Connect your Notion database to get started.
            </p>
            <div className="glass rounded-xl border border-dashed border-muted-foreground/25 p-6 mb-6">
              <p className="text-sm text-muted-foreground">
                Configure <code className="rounded bg-muted px-2 py-1 text-xs font-mono">NOTION_TOKEN</code> and{' '}
                <code className="rounded bg-muted px-2 py-1 text-xs font-mono">NOTION_DATABASE_ID</code>
              </p>
            </div>
            <Button asChild size="lg" className="shadow-primary">
              <Link href="/about">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
      {posts.map((post, index) => (
        <div 
          key={post.id} 
          className="animate-slide-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <BlogCard post={post} />
        </div>
      ))}
    </div>
  )
}

async function HeroSection() {
  const posts = await getDatabasePages()
  const recentPosts = posts.slice(0, 3)

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.02]"></div>
      
      <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-4rem)]">
          
          {/* Left Column - Main Content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Avatar & Status */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/10 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <User className="w-7 h-7 text-primary-foreground" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Hello, I'm a <span className="gradient-text">Developer</span>
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground font-light max-w-2xl mx-auto lg:mx-0">
                Sharing code, ideas, and experiences
              </p>
            </div>

            {/* Skills & Status */}
            <div className="space-y-4">
              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                {['React', 'Next.js', 'TypeScript', 'Node.js'].map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full text-sm">
                <Coffee className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Currently working on</span>
                <span className="font-medium">Next.js Projects</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center lg:justify-start gap-8">
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold">{posts.length}</div>
                <div className="text-sm text-muted-foreground">Articles</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold">
                  {Array.from(new Set(posts.flatMap(post => post.tags || []))).length}
                </div>
                <div className="text-sm text-muted-foreground">Topics</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold">2024</div>
                <div className="text-sm text-muted-foreground">Since</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button size="lg" asChild className="group">
                <Link href="/articles">
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Articles
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/about">
                  <User className="w-4 h-4 mr-2" />
                  About Me
                </Link>
              </Button>
            </div>

            {/* Social Links */}
            <div className="flex justify-center lg:justify-start gap-3">
              <Button variant="ghost" size="sm" className="group">
                <Github className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                GitHub
              </Button>
              <Button variant="ghost" size="sm" className="group">
                <Twitter className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Twitter
              </Button>
              <Button variant="ghost" size="sm" className="group">
                <Mail className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Contact
              </Button>
            </div>
          </div>

          {/* Right Column - Recent Posts Preview */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold mb-2">Latest Articles</h2>
              <p className="text-muted-foreground">Recent insights and tutorials</p>
            </div>

            <div className="space-y-4">
              {recentPosts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  className="block group"
                >
                  <div className="p-4 bg-card border border-border rounded-lg hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-start gap-3">
                      {post.cover && (
                        <Image
                          src={post.cover}
                          alt=""
                          width={60}
                          height={60}
                          className="w-15 h-15 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {post.summary || 'Click to read this article...'}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(post.date).toLocaleDateString()}</span>
                          {post.readingTime && (
                            <>
                              <span>•</span>
                              <Clock className="h-3 w-3" />
                              <span>{post.readingTime}m read</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center lg:text-right">
              <Button variant="outline" asChild>
                <Link href="/articles">
                  View All Articles
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

async function AboutSection() {
  const posts = await getDatabasePages()
  const recentPosts = posts.slice(0, 3)

  return (
    <section className="py-16 lg:py-20">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* About Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold">
                About <span className="gradient-text">Me</span>
              </h2>
              
              <div className="prose prose-lg text-muted-foreground max-w-none">
                <p>
                  안녕하세요! 저는 웹 개발과 기술에 열정을 가진 개발자입니다. 
                  복잡한 문제를 해결하고, 사용자 경험을 개선하는 일에 보람을 느낍니다.
                </p>
                <p>
                  주로 <strong>React</strong>, <strong>Next.js</strong>, <strong>TypeScript</strong>를 
                  사용해 프론트엔드를 개발하며, 백엔드와 인프라에도 관심이 많습니다.
                </p>
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">주요 기술 스택</h3>
                <div className="flex flex-wrap gap-2">
                  {['React', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Prisma', 'PostgreSQL'].map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Current Focus */}
              <div className="p-6 bg-muted/50 rounded-2xl border border-border/50">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Code className="w-5 h-5 text-primary" />
                  현재 집중하고 있는 것들
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Next.js 14와 Server Actions 탐구
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    AI/ML과 웹 개발의 융합
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    오픈소스 프로젝트 기여
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Posts */}
          <div className="space-y-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Recent <span className="gradient-text">Posts</span>
              </h2>
              
              <div className="space-y-6">
                {recentPosts.map((post, index) => (
                  <article
                    key={post.id}
                    className="group p-6 bg-card border border-border rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <time dateTime={post.date}>
                          {new Date(post.date).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </time>
                        {post.readingTime && (
                          <>
                            <span>•</span>
                            <span>{post.readingTime}분 읽기</span>
                          </>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-semibold leading-tight group-hover:text-primary transition-colors">
                        <Link href={`/posts/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>
                      
                      <p className="text-muted-foreground line-clamp-2">
                        {post.summary || '흥미로운 내용을 담고 있는 글입니다...'}
                      </p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-wrap gap-1">
                          {post.tags?.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/posts/${post.slug}`}>
                            읽기
                            <ArrowRight className="ml-1 w-3 h-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="text-center">
                <Button variant="outline" asChild>
                  <Link href="/articles">
                    모든 글 보기
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>
    </div>
  )
}

export const revalidate = 3600