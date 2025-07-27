'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, UserButton } from '@clerk/nextjs'
import { ThemeToggle } from '../common/theme-toggle'
import { AnimatedLogo } from '../common/animated-logo'
import { NotificationBadge } from '../common/notification-badge'
import { QuickSearch } from '../common/quick-search'
import { Button } from '../ui/button'
import { Menu, X, LogIn, UserPlus, LayoutDashboard, ChevronDown, Sparkles, Globe, BookOpen, Users, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/site.config'

const platformNavItems = [
  { href: '/', label: 'Home', icon: Globe },
  { href: '/about', label: 'About', icon: BookOpen },
  { href: '/articles', label: 'Articles', icon: BookOpen },
]

export function PlatformHeader() {
  const pathname = usePathname()
  const { isSignedIn, user } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300 ease-in-out",
      scrolled 
        ? "glass-header animate-slide-down" 
        : "glass-header-light"
    )}>
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className="group transition-all duration-200 hover:scale-[1.02]"
        >
          <AnimatedLogo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {platformNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                isActive(item.href) 
                  ? "text-primary bg-primary/10 shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {item.icon && (
                <item.icon className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  "group-hover:scale-110"
                )} />
              )}
              <span>{item.label}</span>
              {isActive(item.href) && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary to-primary/80 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Center Search (Desktop) */}
        <div className="hidden lg:flex flex-1 justify-center max-w-md mx-8">
          <QuickSearch />
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          
          {isSignedIn ? (
            <div className="flex items-center space-x-3">
              <Button asChild variant="outline" size="sm" className="group">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                  Dashboard
                </Link>
              </Button>
              <div className="relative">
                <UserButton 
                  afterSignOutUrl="/" 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-200"
                    }
                  }}
                />
                <NotificationBadge variant="success" />
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button asChild variant="ghost" size="sm" className="group">
                <Link href="/sign-in">
                  <LogIn className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                  Sign In
                </Link>
              </Button>
              <Button asChild size="sm" className="group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-primary/25 transition-all duration-200">
                <Link href="/sign-up">
                  <UserPlus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                  <span>Sign Up</span>
                  <Sparkles className="h-3 w-3 ml-1 opacity-70" />
                </Link>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-all duration-200"
            aria-label="Toggle mobile menu"
          >
            <div className="relative w-5 h-5">
              <Menu className={cn(
                "absolute inset-0 w-5 h-5 transition-all duration-200",
                mobileMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
              )} />
              <X className={cn(
                "absolute inset-0 w-5 h-5 transition-all duration-200",
                mobileMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
              )} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={cn(
        "md:hidden fixed inset-0 z-50 transition-all duration-300 ease-in-out",
        mobileMenuOpen ? "visible opacity-100" : "invisible opacity-0"
      )}>
        {/* Backdrop */}
        <div 
          className={cn(
            "absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Menu Content */}
        <div className={cn(
          "absolute top-16 left-0 right-0 glass-mobile-menu transition-transform duration-300 ease-in-out",
          mobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        )}>
          <div className="container py-6 space-y-1">
            {platformNavItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "group flex items-center space-x-3 px-4 py-3 text-base font-medium rounded-xl transition-all duration-200",
                  "animate-fade-in-up",
                  isActive(item.href) 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {item.icon && (
                  <item.icon className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    "group-hover:scale-110"
                  )} />
                )}
                <span>{item.label}</span>
                {isActive(item.href) && (
                  <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                )}
              </Link>
            ))}
            
            {!isSignedIn && (
              <div className="pt-4 mt-4 border-t space-y-2">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center space-x-3 px-4 py-3 text-base font-medium rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 animate-fade-in-up"
                  style={{ animationDelay: '200ms' }}
                >
                  <LogIn className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center space-x-3 px-4 py-3 text-base font-medium rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg transition-all duration-200 animate-fade-in-up"
                  style={{ animationDelay: '250ms' }}
                >
                  <UserPlus className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  <span>Sign Up</span>
                  <Sparkles className="h-4 w-4 ml-auto opacity-70" />
                </Link>
              </div>
            )}
            
            {isSignedIn && (
              <div className="pt-4 mt-4 border-t">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center space-x-3 px-4 py-3 text-base font-medium rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 animate-fade-in-up"
                  style={{ animationDelay: '200ms' }}
                >
                  <LayoutDashboard className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  <span>Dashboard</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}