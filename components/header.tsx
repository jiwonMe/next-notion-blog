import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './theme-toggle'
import { Sparkles } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full glass-strong border-b">
      <div className="container mx-auto flex h-20 max-w-screen-2xl items-center justify-between px-6">
        <Link 
          href="/" 
          className="group flex items-center space-x-3 transition-transform hover:scale-105"
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/60 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-background rounded-xl p-2">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold gradient-text">
              Noxion
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Powered by Notion
            </span>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild className="relative group overflow-hidden">
            <Link href="/">
              <span className="relative z-10">Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="relative group overflow-hidden">
            <Link href="/about">
              <span className="relative z-10">About</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </Button>
        </nav>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}