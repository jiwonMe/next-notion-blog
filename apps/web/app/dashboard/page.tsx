import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getUserByClerkId, getBlogsByOwner, createUser, createBlog } from '@/lib/supabase'
import { BlogCard } from '@/components/dashboard/blog-card'
import { CreateBlogButton } from '@/components/dashboard/create-blog-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, BookOpen, Users, BarChart3 } from 'lucide-react'

export default async function DashboardPage() {
  const clerkUser = await currentUser()
  
  if (!clerkUser) {
    redirect('/sign-in')
  }

  // Get or create user in our database
  let user = await getUserByClerkId(clerkUser.id)
  
  if (!user) {
    user = await createUser({
      clerk_id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: clerkUser.fullName || clerkUser.firstName || 'User',
      avatar_url: clerkUser.imageUrl,
    })
  }

  // Get user's blogs
  const blogs = await getBlogsByOwner(user.id)

  // If user has no blogs, create a default one
  if (blogs.length === 0) {
    const username = clerkUser.username || 
      clerkUser.emailAddresses[0]?.emailAddress.split('@')[0] || 
      'user'
    
    const defaultBlog = await createBlog({
      owner_id: user.id,
      title: `${user.name}'s Blog`,
      slug: username,
      description: 'Welcome to my blog powered by Noxion!',
    })
    
    blogs.push(defaultBlog)
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your blogs and content
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogs.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Connect Notion to sync posts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Enable analytics to track views
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Blogs Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Your Blogs
          </h2>
          <CreateBlogButton userId={user.id} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Get started with your blog setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Connect Notion Database
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Install Analytics Plugin
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Configure Comments
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}