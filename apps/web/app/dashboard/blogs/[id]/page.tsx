import { currentUser } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { getUserByClerkId, getBlogsByOwner } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Database, Plug, BarChart3, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { NotionConfigForm } from '@/components/dashboard/notion-config-form'
import { BlogSettingsForm } from '@/components/dashboard/blog-settings-form'
import { PluginManager } from '@/components/dashboard/plugin-manager'

interface BlogManagePageProps {
  params: { id: string }
}

export default async function BlogManagePage({ params }: BlogManagePageProps) {
  const clerkUser = await currentUser()
  
  if (!clerkUser) {
    redirect('/sign-in')
  }

  const user = await getUserByClerkId(clerkUser.id)
  if (!user) {
    redirect('/sign-in')
  }

  const blogs = await getBlogsByOwner(user.id)
  const blog = blogs.find(b => b.id === params.id)
  
  if (!blog) {
    notFound()
  }

  const isConfigured = blog.notion_database_id && blog.notion_token
  const blogUrl = `/${blog.slug}`

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {blog.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your blog settings and configuration
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={isConfigured ? "default" : "secondary"}>
              {isConfigured ? "Configured" : "Setup Required"}
            </Badge>
            <Button asChild variant="outline">
              <Link href={blogUrl} target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Blog
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="notion" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Notion
          </TabsTrigger>
          <TabsTrigger value="plugins" className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            Plugins
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blog Settings</CardTitle>
              <CardDescription>
                Configure your blog's basic information and appearance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BlogSettingsForm blog={blog} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notion Integration</CardTitle>
              <CardDescription>
                Connect your blog to a Notion database to sync your content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotionConfigForm blog={blog} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plugins" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plugin Manager</CardTitle>
              <CardDescription>
                Install and configure plugins to extend your blog's functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PluginManager blogId={blog.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                View your blog's performance metrics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Analytics Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Install the analytics plugin to start tracking your blog's performance
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}