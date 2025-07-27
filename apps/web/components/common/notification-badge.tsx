'use client'

import { cn } from '@/lib/utils'

interface NotificationBadgeProps {
  count?: number
  className?: string
  variant?: 'success' | 'warning' | 'error' | 'info'
  pulse?: boolean
}

export function NotificationBadge({ 
  count, 
  className, 
  variant = 'success', 
  pulse = true 
}: NotificationBadgeProps) {
  const variants = {
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-black',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white'
  }

  return (
    <div className={cn(
      "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background transition-all duration-200",
      variants[variant],
      pulse && "animate-pulse",
      count && count > 0 && "w-5 h-5 flex items-center justify-center text-[10px] font-bold",
      className
    )}>
      {count && count > 0 && (
        <span className="leading-none">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  )
}