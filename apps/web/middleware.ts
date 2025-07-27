import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/og(.*)',
  '/api/rss(.*)',
  '/sitemap.xml',
  '/robots.txt',
  '/favicon.ico',
  '/(.*)/posts/(.*)', // Public blog posts
  '/(.*)/rss.xml', // Public RSS feeds
  '/about',
  '/articles',
  '/articles/(.*)',
])

// Define dashboard routes that require authentication
const isDashboardRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/api/admin(.*)',
  '/api/dashboard(.*)',
])

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl
  
  // Handle dashboard routes - require authentication
  if (isDashboardRoute(req)) {
    await auth.protect()
  }
  
  // Handle blog routes - determine if it's a user blog
  if (pathname.startsWith('/') && pathname !== '/' && !pathname.startsWith('/api/')) {
    const segments = pathname.split('/').filter(Boolean)
    
    if (segments.length > 0) {
      const potentialUsername = segments[0]
      
      // Skip if it's a known app route
      if (['dashboard', 'admin', 'sign-in', 'sign-up', 'articles', 'about'].includes(potentialUsername)) {
        return NextResponse.next()
      }
      
      // This is a potential user blog route
      // We'll validate the username exists in our database via API
      return NextResponse.next()
    }
  }
  
  // For public routes, continue without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }
  
  // For all other routes, require authentication
  await auth.protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}