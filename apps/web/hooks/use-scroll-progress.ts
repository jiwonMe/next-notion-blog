'use client'

import { useState, useEffect } from 'react'

interface UseScrollProgressOptions {
  /** Scroll threshold for isScrolled state (default: 50) */
  scrollThreshold?: number
  /** Maximum scroll distance for full progress (default: 200) */
  maxScrollDistance?: number
  /** Whether to use passive event listeners (default: true) */
  passive?: boolean
}

interface UseScrollProgressReturn {
  /** Current scroll position in pixels */
  scrollY: number
  /** Whether page is scrolled beyond threshold */
  isScrolled: boolean
  /** Scroll progress as a value between 0 and 1 */
  scrollProgress: number
  /** Scroll direction: 'up' | 'down' | null */
  scrollDirection: 'up' | 'down' | null
  /** Whether user is actively scrolling */
  isScrolling: boolean
}

export function useScrollProgress(options: UseScrollProgressOptions = {}): UseScrollProgressReturn {
  const {
    scrollThreshold = 50,
    maxScrollDistance = 200,
    passive = true,
  } = options

  const [scrollY, setScrollY] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Update scroll position
      setScrollY(currentScrollY)
      
      // Update scroll state
      setIsScrolled(currentScrollY > scrollThreshold)
      
      // Calculate scroll progress (0-1)
      const progress = Math.min(currentScrollY / maxScrollDistance, 1)
      setScrollProgress(progress)
      
      // Update scroll direction
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down')
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up')
      }
      
      // Update scrolling state
      setIsScrolling(true)
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false)
        setScrollDirection(null)
      }, 150)
      
      setLastScrollY(currentScrollY)
    }

    // Set initial values
    handleScroll()

    // Add event listener
    window.addEventListener('scroll', handleScroll, { passive })

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [scrollThreshold, maxScrollDistance, passive, lastScrollY])

  return {
    scrollY,
    isScrolled,
    scrollProgress,
    scrollDirection,
    isScrolling,
  }
} 