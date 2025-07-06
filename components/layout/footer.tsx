import { cn } from '@/lib/utils'

export function Footer() {
  return (
    <footer className={cn(
      "mt-auto border-t bg-background", // Basic footer styling
      "py-8" // Reduced padding
    )}>
      <div className={cn(
        "container mx-auto max-w-screen-xl px-6", // Container with smaller max width
        "flex flex-col items-center justify-center space-y-3", // Centered layout
        "text-center" // Center text alignment
      )}>
        {/* Brand */}
        <div className={cn(
          "text-sm font-medium text-foreground" // Simple brand text
        )}>
          Noxion
        </div>
        
        {/* Copyright */}
        <p className={cn(
          "text-xs text-muted-foreground" // Small copyright text
        )}>
          © 2024 Noxion. Powered by Notion & Next.js
        </p>
      </div>
    </footer>
  )
}