'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './theme-toggle'
import { Sparkles, Menu, X, Home, FileText, User } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/articles', label: 'Articles', icon: FileText },
  { href: '/about', label: 'About', icon: User },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full flex items-center justify-center pt-4 px-4">
      {/* Dynamic Island Style Navigation Container */}
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-[32px] blur-xl opacity-60" />
        
        {/* Main navigation pill */}
        <div className="relative bg-background/70 backdrop-blur-2xl border border-border/30 rounded-[28px] shadow-2xl shadow-black/20 dark:shadow-black/40 supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center px-6 py-3 min-w-fit">
            {/* Left: Logo */}
            <div className="flex-shrink-0">
              <Link 
                href="/" 
                className="group flex items-center space-x-2"
              >
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 to-primary/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <div className="relative bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-2.5 shadow-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                    Noxion
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
                    NOTION BLOG
                  </span>
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
              <div className="bg-muted/20 rounded-full p-1">
                <ThemeToggle />
              </div>
              
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
            <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-xl opacity-60" />
            
            {/* Mobile menu content */}
            <div className="relative bg-background/80 backdrop-blur-2xl border border-border/30 rounded-3xl shadow-2xl shadow-black/20 dark:shadow-black/40 supports-[backdrop-filter]:bg-background/70 p-6">
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