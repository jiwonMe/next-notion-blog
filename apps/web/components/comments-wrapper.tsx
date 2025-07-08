'use client'

import dynamic from 'next/dynamic'
import { getCommentsComponent } from '@/lib/noxion'

interface CommentsWrapperProps {
  postSlug: string
  supabaseUrl: string
  supabaseKey: string
  className?: string
}

const CommentsWrapper = dynamic(
  async () => {
    const commentsComponent = getCommentsComponent()
    
    // Handle string import paths
    if (typeof commentsComponent === 'string') {
      const mod = await import(commentsComponent)
      return mod.CommentsSection
    }
    
    // Handle lazy-loaded components (functions that return promises)
    if (typeof commentsComponent === 'function') {
      try {
        const result = (commentsComponent as () => Promise<React.ComponentType<any>>)()
        // Check if it's a Promise
        if (result && typeof result.then === 'function') {
          const loadedComponent = await result
          return loadedComponent
        }
        // If not a promise, it's a regular component
        return commentsComponent as React.ComponentType<any>
      } catch {
        // Fallback to treating it as a regular component
        return commentsComponent as React.ComponentType<any>
      }
    }
    
    // Handle static components or fallback
    if (commentsComponent) {
      return commentsComponent as React.ComponentType<any>
    }
    
    // Return a null component if no comments component is available
    return function NoComments() { return null }
  },
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-300 rounded"></div>
          <div className="h-20 bg-gray-300 rounded"></div>
        </div>
      </div>
    ),
  }
) as React.ComponentType<CommentsWrapperProps>

export function ClientCommentsSection(props: CommentsWrapperProps) {
  return <CommentsWrapper {...props} />
}