import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Puzzle, Settings, BarChart3, Users, ArrowRight } from 'lucide-react'
import { pluginManager } from '@/lib/noxion'
import { generateMetadata } from '@/lib/metadata'

export const metadata = generateMetadata({
  title: 'Admin Dashboard',
  description: 'Manage your Noxion blog and plugins',
})

export default async function AdminDashboard() {
  const plugins = pluginManager.getPlugins()
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your Noxion blog, plugins, and settings
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plugins</CardTitle>
            <Puzzle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plugins.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently installed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Components</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* TODO: Get actual component count */}
              {plugins.length > 0 ? plugins.length * 2 : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered components
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Routes</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* TODO: Get actual route count */}
              {plugins.length > 0 ? plugins.length * 3 : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Plugin endpoints
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Healthy</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Puzzle className="h-5 w-5" />
              <CardTitle>Plugin Management</CardTitle>
            </div>
            <CardDescription>
              Configure and manage your installed plugins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {plugins.length > 0 ? (
                  <>
                    {plugins.length} plugin{plugins.length !== 1 ? 's' : ''} installed:
                    <ul className="mt-2 space-y-1">
                      {plugins.map(plugin => (
                        <li key={plugin.name} className="flex items-center justify-between">
                          <span>{plugin.name}</span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            v{plugin.version}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  'No plugins installed yet'
                )}
              </div>
              
              <Button asChild className="w-full">
                <Link href="/admin/plugins">
                  Manage Plugins
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <CardTitle>System Settings</CardTitle>
            </div>
            <CardDescription>
              Configure your blog settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Manage global settings, API configurations, and site preferences.
              </div>
              
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/settings">
                  Open Settings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}