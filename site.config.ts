import { LucideIcon, Sparkles, Zap, Star, Heart, BookOpen } from 'lucide-react'

export interface SiteConfig {
  // 기본 사이트 정보
  name: string
  shortName: string
  description: string
  url: string
  
  // 메타데이터
  keywords: string[]
  author: {
    name: string
    email?: string
    url?: string
  }
  
  // 로고 및 브랜딩
  logo: {
    icon: LucideIcon
    text: string
    showText?: boolean
  }
  
  // 소셜 링크
  social?: {
    twitter?: string
    github?: string
    linkedin?: string
    email?: string
  }
  
  // 내비게이션
  navigation: {
    header: NavItem[]
    footer?: NavItem[]
  }
  
  // SEO 설정
  seo: {
    defaultImage?: string
    twitterHandle?: string
    locale: string
  }
  
  // 기능 설정
  features: {
    search: boolean
    darkMode: boolean
    analytics?: string
    comments?: boolean
  }
}

export interface NavItem {
  href: string
  label: string
  icon?: LucideIcon
  external?: boolean
}

// 사이트 설정
export const siteConfig: SiteConfig = {
  // 기본 사이트 정보
  name: "Noxion Blog",
  shortName: "Noxion",
  description: "Transform your Notion pages into a stunning blog. Share your thoughts, stories, and insights with the world.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com",
  
  // 메타데이터
  keywords: [
    "notion", 
    "blog", 
    "writing", 
    "publishing", 
    "nextjs", 
    "react", 
    "typescript",
    "markdown",
    "content management"
  ],
  author: {
    name: "Noxion",
    email: "contact@noxion.dev",
    url: "https://noxion.dev"
  },
  
  // 로고 및 브랜딩
  logo: {
    icon: Sparkles, // Sparkles, Zap, Star, Heart, BookOpen 등에서 선택 가능
    text: "Noxion",
    showText: true
  },
  
  // 소셜 링크
  social: {
    twitter: "@noxion_dev",
    github: "https://github.com/noxion",
    email: "contact@noxion.dev"
  },
  
  // 내비게이션
  navigation: {
    header: [
      { href: '/', label: 'Home' },
      { href: '/articles', label: 'Articles' },
      { href: '/about', label: 'About' }
    ],
    footer: [
      { href: '/about', label: 'About' },
      { href: '/articles', label: 'Articles' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' }
    ]
  },
  
  // SEO 설정
  seo: {
    locale: "ko_KR", // 한국어 설정
    twitterHandle: "@noxion_dev"
  },
  
  // 기능 설정
  features: {
    search: true,
    darkMode: true,
    analytics: process.env.NEXT_PUBLIC_GA_ID,
    comments: false
  }
}

// 환경별 설정을 위한 헬퍼 함수
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  return 'http://localhost:3000'
}

// 메타데이터 생성을 위한 헬퍼 함수
export function getMetadataBase() {
  return {
    title: siteConfig.name,
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.author.name }],
    creator: siteConfig.author.name,
    openGraph: {
      type: 'website',
      locale: siteConfig.seo.locale,
      url: siteConfig.url,
      siteName: siteConfig.name,
      title: siteConfig.name,
      description: siteConfig.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.name,
      description: siteConfig.description,
      creator: siteConfig.seo.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
} 