import { Github, Twitter } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-background">
      <div className="container mx-auto max-w-screen-2xl px-4 py-12">
        <div className="flex flex-col items-center justify-between space-y-6 md:flex-row md:space-y-0">
          <div className="flex flex-col items-center space-y-2 md:items-start">
            <div className="flex items-center space-x-2">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-lg font-bold text-transparent">
                Noxion
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Noxion. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Powered by Notion & Next.js
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <span className="sr-only">GitHub</span>
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <span className="sr-only">Twitter</span>
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Built with ❤️ using{' '}
            <a 
              href="https://ui.shadcn.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              shadcn/ui
            </a>{' '}
            and{' '}
            <a 
              href="https://tailwindcss.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              Tailwind CSS
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}