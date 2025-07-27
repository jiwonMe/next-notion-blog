'use client'

import { siteConfig } from '@/site.config'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface AnimatedLogoProps {
  className?: string
  showSubtitle?: boolean
}

export function AnimatedLogo({ className, showSubtitle = true }: AnimatedLogoProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className={cn("flex items-center space-x-3", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Glow effect */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-full blur-sm transition-all duration-300",
          isHovered ? "opacity-100 scale-110" : "opacity-75 scale-100"
        )} />
        
        {/* Main logo container */}
        <div className="relative bg-gradient-to-r from-primary to-primary/80 p-2.5 rounded-full transition-all duration-300">
          <siteConfig.logo.icon className={cn(
            "h-5 w-5 text-white transition-all duration-300",
            isHovered && "scale-110 rotate-12"
          )} />
        </div>
        
        {/* Sparkle effects */}
        <div className={cn(
          "absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full transition-all duration-300",
          isHovered ? "opacity-100 scale-100" : "opacity-0 scale-0"
        )} />
        <div className={cn(
          "absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-400 rounded-full transition-all duration-500 delay-100",
          isHovered ? "opacity-100 scale-100" : "opacity-0 scale-0"
        )} />
      </div>
      
      <div className="flex flex-col">
        <span className={cn(
          "text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent transition-all duration-300",
          isHovered && "scale-105"
        )}>
          {siteConfig.name}
        </span>
        {showSubtitle && (
          <span className={cn(
            "text-xs text-muted-foreground font-medium hidden sm:block transition-all duration-300",
            isHovered && "text-primary/80"
          )}>
            Multi-tenant Blog Platform
          </span>
        )}
      </div>
    </div>
  )
}