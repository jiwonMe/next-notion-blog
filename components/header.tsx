'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './theme-toggle'
import { Sparkles, Menu, X, Home, FileText, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/articles', label: 'Articles', icon: FileText },
  { href: '/about', label: 'About', icon: User },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY
      
      // Track if page is scrolled for background effect
      setIsScrolled(currentScrollY > 50)
      
      // Show header when at top of page
      if (currentScrollY < 10) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past 100px
        setIsVisible(false)
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', controlNavbar)
    return () => window.removeEventListener('scroll', controlNavbar)
  }, [lastScrollY])

  return (
    <header className={cn(
      "fixed top-0 z-50 w-full", // Fixed positioning
      "flex items-center justify-center", // Layout
      "pt-4 px-4", // Padding
      "transition-transform duration-300 ease-in-out", // Smooth animation
      isVisible ? "translate-y-0" : "-translate-y-full" // Hide/show based on scroll
    )}>
      {/* Dynamic Island Style Navigation Container */}
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-full blur-xl opacity-60" />
        
        {/* Main navigation pill */}
        <div className={cn(
          "relative rounded-full shadow-2xl border transition-all duration-300", // Base styles
          "backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60", // Backdrop blur
          isScrolled 
            ? "bg-background/90 border-border/50 shadow-black/30 dark:shadow-black/50" // Scrolled state
            : "bg-background/40 border-border/20 shadow-black/10 dark:shadow-black/20" // Top of page state
        )}>
          <div className="flex items-center px-6 py-3 min-w-fit">
            {/* Logo Section */}
            <div className={cn(
              "flex-shrink-0" // Prevent shrinking
            )}>
              <Link 
                href="/" 
                className={cn(
                  "group", // Hover group
                  "flex items-center space-x-3", // Flex layout with spacing
                  "transition-all duration-200", // Smooth transitions
                  "hover:scale-105" // Subtle hover scale
                )}
              >
                {/* Logo Icon */}
                <div className={cn(
                  "bg-primary", // Primary color background
                  "rounded-full p-2", // Rounded corners and padding
                  "shadow-md", // Medium shadow
                  "group-hover:shadow-lg", // Larger shadow on hover
                  "transition-shadow duration-200" // Smooth shadow transition
                )}>
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </Link>
            </div>
            
            {/* Center: Desktop Navigation */}
            <div className="flex-1 flex justify-center mx-8">
              <nav className="hidden md:flex items-center">
                <div className="flex items-center space-x-1 bg-muted/20 rounded-full p-1.5">
                  {navItems.map((item) => {
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "relative flex items-center space-x-2 px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300",
                          active
                            ? "bg-background/90 text-foreground shadow-lg shadow-black/5 border border-border/50 scale-105"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/40 hover:scale-105"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="hidden lg:block">{item.label}</span>
                        {active && (
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 opacity-50" />
                        )}
                      </Link>
                    )
                  })}
                </div>
              </nav>
            </div>
            
            {/* Right: Actions */}
            <div className="flex-shrink-0 flex items-center space-x-3">
              <ThemeToggle />
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden relative p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-full transition-all duration-300 hover:scale-110"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-4 right-4 mt-4 z-40">
          <div className="relative">
            {/* Glow effect for mobile menu */}
            <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-full blur-xl opacity-60" />
            
            {/* Mobile menu content */}
            <div className={cn(
              "relative rounded-full shadow-2xl border transition-all duration-300 p-6", // Base styles
              "backdrop-blur-2xl supports-[backdrop-filter]:bg-background/70", // Backdrop blur
              isScrolled 
                ? "bg-background/90 border-border/50 shadow-black/30 dark:shadow-black/50" // Scrolled state
                : "bg-background/50 border-border/20 shadow-black/10 dark:shadow-black/20" // Top of page state
            )}>
              <div className="space-y-3">
                {navItems.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center space-x-4 px-5 py-4 text-base font-medium rounded-2xl transition-all duration-300",
                        active
                          ? "bg-primary/10 text-primary border border-primary/20 shadow-lg scale-105"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/30 hover:scale-105"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-xl transition-colors",
                        active 
                          ? "bg-primary/20" 
                          : "bg-muted/50"
                      )}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span>{item.label}</span>
                      {active && (
                        <div className="ml-auto w-2 h-2 bg-primary rounded-full animate-pulse" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}