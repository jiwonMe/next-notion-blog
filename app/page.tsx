import { getDatabasePages } from '@/lib/notion'
import { BlogCard } from '@/components/blog-card'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'
import { ArrowRight, Sparkles, Zap, Palette } from 'lucide-react'
import Link from 'next/link'
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

function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 lg:py-24">
      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-primary/20 to-transparent rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-l from-primary/10 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
      
      <div className="relative container mx-auto max-w-screen-xl px-6 text-center">
        <div className="animate-fade-in">
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Powered by Notion & Next.js</span>
            </div>
          </div>
          
          <h1 className="mb-8 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
            Write in{' '}
            <span className="relative">
              <span className="gradient-text">Notion</span>
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-xl -z-10"></div>
            </span>
            <br />
            Publish{' '}
            <span className="gradient-text animate-gradient bg-gradient-to-r from-primary via-primary/80 to-primary">
              Beautifully
            </span>
          </h1>
          
          <p className="mx-auto mb-12 max-w-3xl text-lg text-muted-foreground lg:text-xl leading-relaxed">
            Transform your Notion pages into a stunning blog. No coding required, 
            just pure creativity. Share your thoughts, stories, and insights with the world.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="shadow-primary group">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/about">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Built with Next.js 14 and optimized for performance"
    },
    {
      icon: Palette,
      title: "Beautiful Design",
      description: "Modern, responsive design that adapts to any screen"
    },
    {
      icon: Sparkles,
      title: "Easy to Use",
      description: "Write in Notion, publish automatically"
    }
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-muted/50 to-transparent">
      <div className="container mx-auto max-w-screen-xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Choose Noxion?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The perfect blend of simplicity and power for modern content creators
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="text-center group animate-slide-up"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="mb-6 relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative mx-auto w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-primary">
                  <feature.icon className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      
      <section className="py-24">
        <div className="container mx-auto max-w-screen-xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 gradient-text">Latest Posts</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover the latest insights, tutorials, and stories from our community
            </p>
          </div>
          
          <Suspense fallback={<LoadingSkeleton />}>
            <BlogPosts />
          </Suspense>
        </div>
      </section>
    </div>
  )
}

export const revalidate = 3600