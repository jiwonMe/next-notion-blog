import { AdminNav } from '@/components/admin/admin-nav'
import { cn } from '@/lib/utils'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin Navigation */}
      <AdminNav />
      
      {/* Main Content */}
      <main className={cn(
        "pt-16", // Account for fixed nav height
        "px-4 sm:px-6 lg:px-8"
      )}>
        {children}
      </main>
    </div>
  )
}