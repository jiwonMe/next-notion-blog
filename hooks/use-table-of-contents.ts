'use client'

import { useEffect, useState, useCallback } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

export function useTableOfContents(content?: string) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')

  // Extract headings from DOM (after markdown is rendered)
  useEffect(() => {
    const timer = setTimeout(() => {
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      const extractedHeadings: Heading[] = []
      
      headingElements.forEach((element) => {
        const level = parseInt(element.tagName.charAt(1))
        const text = element.textContent?.trim() || ''
        const id = element.id || ''
        
        if (id && text) {
          extractedHeadings.push({ id, text, level })
        }
      })
      
      setHeadings(extractedHeadings)
    }, 100) // Small delay to ensure DOM is ready
    
    return () => clearTimeout(timer)
  }, [content])

  // Intersection observer for active heading detection
  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the heading that's currently most visible
        const visibleHeadings = entries
          .filter(entry => entry.isIntersecting)
          .map(entry => ({
            id: entry.target.id,
            top: entry.boundingClientRect.top,
            ratio: entry.intersectionRatio
          }))
          .sort((a, b) => a.top - b.top)

        if (visibleHeadings.length > 0) {
          setActiveId(visibleHeadings[0].id)
        } else {
          // If no headings are visible, find the one closest to the top
          const allHeadings = headings.map(heading => {
            const element = document.getElementById(heading.id)
            return element ? {
              id: heading.id,
              top: element.getBoundingClientRect().top
            } : null
          }).filter(Boolean)
          
          if (allHeadings.length > 0) {
            const closestHeading = allHeadings.reduce((closest, current) => 
              Math.abs(current!.top) < Math.abs(closest!.top) ? current : closest
            )
            setActiveId(closestHeading!.id)
          }
        }
      },
      {
        rootMargin: '-10% 0% -80% 0%',
        threshold: [0, 0.1, 0.5, 1]
      }
    )

    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  // Scroll to heading
  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const header = document.querySelector('header')
      const headerHeight = header?.offsetHeight || 0
      const offset = headerHeight + 16
      
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }, [])

  return {
    headings,
    activeId,
    scrollToHeading
  }
}