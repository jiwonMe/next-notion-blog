'use client'

import { cn } from '@/lib/utils'

interface ProgressiveBlurBackdropProps {
  /** Scroll progress value between 0 and 1 */
  scrollProgress: number
  /** Whether the page is scrolled beyond threshold */
  isScrolled: boolean
  /** Custom className for the backdrop container */
  className?: string
  /** Base height in pixels (default: 32) */
  baseHeight?: number
  /** Additional height per scroll progress (default: 16) */
  dynamicHeight?: number
  /** Maximum blur intensity multiplier (default: 1.2) */
  maxBlurMultiplier?: number
}

export function ProgressiveBlurBackdrop({
  scrollProgress,
  isScrolled,
  className,
  baseHeight = 32,
  dynamicHeight = 16,
  maxBlurMultiplier = 1.2,
}: ProgressiveBlurBackdropProps) {
  
  // Calculate dynamic blur values based on scroll progress
  const getBlurIntensity = (baseBlur: number, multiplier: number = 1) => {
    const intensity = Math.max(0.3, scrollProgress) * multiplier
    return Math.round(baseBlur * intensity)
  }

  // Cubic bezier easing function for smooth curves
  const cubicBezier = (t: number) => {
    return t * t * (3 - 2 * t) // Smooth hermite interpolation
  }

  // Generate mathematical curve points for masks
  const generateCurvePoints = (startOpacity: number, endOpacity: number, steps: number) => {
    const points = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const easedT = cubicBezier(t)
      const opacity = startOpacity + (endOpacity - startOpacity) * easedT
      const position = (i / steps) * 100
      points.push(`rgba(0,0,0,${opacity}) ${position}%`)
    }
    return points.join(', ')
  }

  return (
    <div 
      className={cn(
        "fixed inset-x-0 top-0 pointer-events-none overflow-hidden",
        "will-change-transform", // Performance optimization
        "transform-gpu", // GPU acceleration
        className
      )}
      style={{
        height: `${baseHeight + scrollProgress * dynamicHeight}px`,
      }}
    >
      {/* Layer 1: Ultra-strong blur at very top */}
      <div 
        className={cn(
          "absolute inset-x-0 top-0 h-full", 
          "bg-gradient-to-b from-background/90 via-background/60 to-transparent",
          "transition-all duration-1000 ease-out",
        )}
        style={{
          backdropFilter: `blur(${getBlurIntensity(32, maxBlurMultiplier)}px)`,
          WebkitBackdropFilter: `blur(${getBlurIntensity(32, maxBlurMultiplier)}px)`,
          mask: `linear-gradient(to bottom, ${generateCurvePoints(1, 0, 8)})`,
          WebkitMask: `linear-gradient(to bottom, ${generateCurvePoints(1, 0, 8)})`,
          transform: 'translateZ(0)', // Force GPU layer
        }}
      />
      
      {/* Layer 2: Strong blur */}
      <div 
        className={cn(
          "absolute inset-x-0 top-0 h-full",
          "bg-gradient-to-b from-background/70 via-background/40 to-transparent",
          "transition-all duration-1000 ease-out",
        )}
        style={{
          backdropFilter: `blur(${getBlurIntensity(24, 1.1)}px)`,
          WebkitBackdropFilter: `blur(${getBlurIntensity(24, 1.1)}px)`,
          mask: `linear-gradient(to bottom, ${generateCurvePoints(0.8, 0, 10)})`,
          WebkitMask: `linear-gradient(to bottom, ${generateCurvePoints(0.8, 0, 10)})`,
          transform: 'translateZ(0)',
        }}
      />
      
      {/* Layer 3: Medium-strong blur */}
      <div 
        className={cn(
          "absolute inset-x-0 top-0 h-full",
          "bg-gradient-to-b from-background/50 via-background/25 to-transparent",
          "transition-all duration-1000 ease-out",
        )}
        style={{
          backdropFilter: `blur(${getBlurIntensity(18, 1.0)}px)`,
          WebkitBackdropFilter: `blur(${getBlurIntensity(18, 1.0)}px)`,
          mask: `linear-gradient(to bottom, ${generateCurvePoints(0.6, 0, 12)})`,
          WebkitMask: `linear-gradient(to bottom, ${generateCurvePoints(0.6, 0, 12)})`,
          transform: 'translateZ(0)',
        }}
      />
      
      {/* Layer 4: Medium blur */}
      <div 
        className={cn(
          "absolute inset-x-0 top-0 h-full",
          "bg-gradient-to-b from-background/35 via-background/15 to-transparent",
          "transition-all duration-1000 ease-out",
        )}
        style={{
          backdropFilter: `blur(${getBlurIntensity(12, 0.9)}px)`,
          WebkitBackdropFilter: `blur(${getBlurIntensity(12, 0.9)}px)`,
          mask: `linear-gradient(to bottom, ${generateCurvePoints(0.4, 0, 14)})`,
          WebkitMask: `linear-gradient(to bottom, ${generateCurvePoints(0.4, 0, 14)})`,
          transform: 'translateZ(0)',
        }}
      />
      
      {/* Layer 5: Light blur */}
      <div 
        className={cn(
          "absolute inset-x-0 top-0 h-full",
          "bg-gradient-to-b from-background/20 via-background/8 to-transparent",
          "transition-all duration-1000 ease-out",
        )}
        style={{
          backdropFilter: `blur(${getBlurIntensity(8, 0.8)}px)`,
          WebkitBackdropFilter: `blur(${getBlurIntensity(8, 0.8)}px)`,
          mask: `linear-gradient(to bottom, ${generateCurvePoints(0.3, 0, 16)})`,
          WebkitMask: `linear-gradient(to bottom, ${generateCurvePoints(0.3, 0, 16)})`,
          transform: 'translateZ(0)',
        }}
      />
      
      {/* Layer 6: Very light blur for smooth transition */}
      <div 
        className={cn(
          "absolute inset-x-0 top-0 h-full",
          "bg-gradient-to-b from-background/10 via-background/3 to-transparent",
          "transition-all duration-1000 ease-out",
        )}
        style={{
          backdropFilter: `blur(${getBlurIntensity(4, 0.7)}px)`,
          WebkitBackdropFilter: `blur(${getBlurIntensity(4, 0.7)}px)`,
          mask: `linear-gradient(to bottom, ${generateCurvePoints(0.2, 0, 18)})`,
          WebkitMask: `linear-gradient(to bottom, ${generateCurvePoints(0.2, 0, 18)})`,
          transform: 'translateZ(0)',
        }}
      />
      
      {/* Color harmony overlay - enhances background integration */}
      <div 
        className={cn(
          "absolute inset-x-0 top-0 h-full",
          "transition-all duration-1000 ease-out",
        )}
        style={{
          background: `linear-gradient(to bottom, 
            hsl(var(--background) / ${0.08 + scrollProgress * 0.05}), 
            hsl(var(--background) / ${0.04 + scrollProgress * 0.02}), 
            transparent)`,
          mask: `linear-gradient(to bottom, ${generateCurvePoints(0.9, 0, 20)})`,
          WebkitMask: `linear-gradient(to bottom, ${generateCurvePoints(0.9, 0, 20)})`,
          transform: 'translateZ(0)',
        }}
      />
      
      {/* Subtle noise texture for depth (visible only on close inspection) */}
      <div 
        className={cn(
          "absolute inset-x-0 top-0 h-full",
          "transition-all duration-1000 ease-out opacity-20",
        )}
        style={{
          background: `radial-gradient(circle at 50% 0%, 
            hsl(var(--foreground) / 0.02), 
            transparent 50%)`,
          mask: `linear-gradient(to bottom, ${generateCurvePoints(0.5, 0, 8)})`,
          WebkitMask: `linear-gradient(to bottom, ${generateCurvePoints(0.5, 0, 8)})`,
          transform: 'translateZ(0)',
        }}
      />
    </div>
  )
} 