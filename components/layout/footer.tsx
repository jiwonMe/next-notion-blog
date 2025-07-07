import Link from 'next/link'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/site.config'

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className={cn(
      "mt-auto border-t bg-background", // Basic footer styling
      "py-8" // Reduced padding
    )}>
      <div className={cn(
        "container mx-auto max-w-screen-xl px-6", // Container with smaller max width
        "flex flex-col items-center justify-center space-y-4", // Centered layout with more space
        "text-center" // Center text alignment
      )}>
        {/* Navigation Links */}
        {siteConfig.navigation.footer && siteConfig.navigation.footer.length > 0 && (
          <nav className={cn(
            "flex flex-wrap items-center justify-center gap-6", // Navigation layout
            "text-sm text-muted-foreground" // Navigation styling
          )}>
            {siteConfig.navigation.footer.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "hover:text-foreground transition-colors duration-200", // Link hover effect
                  "hover:underline underline-offset-4" // Underline effect
                )}
                {...(item.external && { target: "_blank", rel: "noopener noreferrer" })}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
        
        {/* Brand */}
        <div className={cn(
          "text-sm font-medium text-foreground" // Simple brand text
        )}>
          {siteConfig.shortName}
        </div>
        
        {/* Copyright */}
        <p className={cn(
          "text-xs text-muted-foreground" // Small copyright text
        )}>
          © {currentYear} {siteConfig.shortName}. Powered by Notion & Next.js
        </p>
        
        {/* Social Links */}
        {siteConfig.social && Object.keys(siteConfig.social).length > 0 && (
          <div className={cn(
            "flex items-center justify-center gap-4", // Social links layout
            "text-xs text-muted-foreground" // Social links styling
          )}>
            {siteConfig.social.email && (
              <a
                href={`mailto:${siteConfig.social.email}`}
                className={cn(
                  "hover:text-foreground transition-colors duration-200", // Link hover effect
                  "hover:underline underline-offset-4" // Underline effect
                )}
              >
                Contact
              </a>
            )}
            {siteConfig.social.github && (
              <a
                href={siteConfig.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "hover:text-foreground transition-colors duration-200", // Link hover effect
                  "hover:underline underline-offset-4" // Underline effect
                )}
              >
                GitHub
              </a>
            )}
            {siteConfig.social.twitter && (
              <a
                href={`https://twitter.com/${siteConfig.social.twitter.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "hover:text-foreground transition-colors duration-200", // Link hover effect
                  "hover:underline underline-offset-4" // Underline effect
                )}
              >
                Twitter
              </a>
            )}
          </div>
        )}
      </div>
    </footer>
  )
}