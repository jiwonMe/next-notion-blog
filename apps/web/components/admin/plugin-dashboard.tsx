'use client'

import { useState, useEffect } from 'react'
import { SerializablePlugin } from '@noxion/types'
import { PluginStatus } from '@noxion/core'
import { toast } from 'sonner'
import { PluginConfigEditor } from './plugin-config-editor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  MoreHorizontal, 
  CheckCircle, 
  XCircle, 
  Info,
  Trash2,
  Download,
  RefreshCw 
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface PluginWithStatus extends SerializablePlugin {
  status: PluginStatus
}

interface PluginDashboardProps {
  plugins?: SerializablePlugin[]
}

export function PluginDashboard({ plugins: initialPlugins }: PluginDashboardProps) {
  const [plugins, setPlugins] = useState<PluginWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPlugin, setEditingPlugin] = useState<SerializablePlugin | null>(null)
  const [configDialogOpen, setConfigDialogOpen] = useState(false)

  // Fetch plugins from API
  const fetchPlugins = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/plugins')
      if (response.ok) {
        const data = await response.json()
        setPlugins(data.plugins)
        toast.success('Plugins loaded successfully')
      } else {
        toast.error('Failed to fetch plugins')
      }
    } catch (error) {
      toast.error('Error fetching plugins')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialPlugins) {
      // Use initial plugins if provided
      const pluginsWithStatus = initialPlugins.map(plugin => ({
        ...plugin,
        status: {
          enabled: true,
          lastUpdated: new Date().toISOString(),
        }
      }))
      setPlugins(pluginsWithStatus)
      setLoading(false)
    } else {
      // Fetch from API
      fetchPlugins()
    }
  }, [initialPlugins])

  const togglePlugin = async (pluginName: string) => {
    const plugin = plugins.find(p => p.name === pluginName)
    if (!plugin) return

    const newStatus = !plugin.status.enabled
    
    try {
      const response = await fetch(`/api/admin/plugins/${pluginName}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: newStatus
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPlugins(prev => 
          prev.map(p => 
            p.name === pluginName 
              ? { ...p, status: data.plugin.status }
              : p
          )
        )
        toast.success(
          `Plugin "${pluginName}" ${newStatus ? 'enabled' : 'disabled'} successfully`,
          {
            description: newStatus 
              ? 'The plugin is now active and running' 
              : 'The plugin has been deactivated'
          }
        )
      } else {
        toast.error(`Failed to ${newStatus ? 'enable' : 'disable'} plugin`)
      }
    } catch (error) {
      toast.error('Error toggling plugin', {
        description: 'Please check your network connection and try again'
      })
    }
  }

  const getStatusIcon = (plugin: PluginWithStatus) => {
    const status = plugin.status
    
    if (status.errors?.length) {
      return <XCircle className="h-4 w-4 text-destructive" />
    }
    
    return status.enabled 
      ? <CheckCircle className="h-4 w-4 text-green-500" />
      : <XCircle className="h-4 w-4 text-muted-foreground" />
  }

  const getStatusBadge = (plugin: PluginWithStatus) => {
    const status = plugin.status
    
    if (status.errors?.length) {
      return <Badge variant="destructive">Error</Badge>
    }
    
    return status.enabled 
      ? <Badge variant="default" className="bg-green-500">Active</Badge>
      : <Badge variant="secondary">Disabled</Badge>
  }

  const handleConfigurePlugin = (plugin: SerializablePlugin) => {
    setEditingPlugin(plugin)
    setConfigDialogOpen(true)
  }

  const handleSaveConfig = async (config: any) => {
    if (!editingPlugin) return

    try {
      const response = await fetch(`/api/admin/plugins/${editingPlugin.name}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config })
      })

      if (response.ok) {
        const data = await response.json()
        setPlugins(prev => 
          prev.map(p => 
            p.name === editingPlugin.name 
              ? { ...p, config: data.plugin.config, status: data.plugin.status }
              : p
          )
        )
        setConfigDialogOpen(false)
        setEditingPlugin(null)
        toast.success(`Configuration saved for "${editingPlugin.name}"`, {
          description: 'Plugin settings have been updated successfully'
        })
      } else {
        toast.error('Failed to save configuration', {
          description: 'Please check your settings and try again'
        })
      }
    } catch (error) {
      toast.error('Error saving configuration', {
        description: 'Network error occurred while saving'
      })
    }
  }

  const handleCancelConfig = () => {
    setConfigDialogOpen(false)
    setEditingPlugin(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plugins</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plugins.length}</div>
            <p className="text-xs text-muted-foreground">
              Installed plugins
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plugins</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plugins.filter(p => p.status.enabled).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Errors</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plugins.filter(p => p.status.errors?.length).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Updates</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Updates pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plugin List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Installed Plugins</h2>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={async () => {
                toast.promise(fetchPlugins(), {
                  loading: 'Refreshing plugins...',
                  success: 'Plugins refreshed successfully',
                  error: 'Failed to refresh plugins'
                })
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                toast.info('Plugin installation coming soon!', {
                  description: 'This feature is currently under development'
                })
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Install New
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {plugins.map((plugin) => (
            <Card key={plugin.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(plugin)}
                    <div>
                      <CardTitle className="text-lg">{plugin.name}</CardTitle>
                      <CardDescription>
                        Version {plugin.version}
                        {plugin.dependencies && plugin.dependencies.length > 0 && (
                          <span className="ml-2">
                            • Depends on: {plugin.dependencies.join(', ')}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(plugin)}
                    
                    <Switch
                      checked={plugin.status.enabled}
                      onCheckedChange={() => togglePlugin(plugin.name)}
                    />
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleConfigurePlugin(plugin)}>
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            toast.info('Plugin details coming soon!', {
                              description: 'Detailed plugin information will be available in a future update'
                            })
                          }}
                        >
                          <Info className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <Separator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            toast.warning('Plugin removal coming soon!', {
                              description: 'Safe plugin removal will be available in a future update'
                            })
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Plugin Configuration Preview */}
                  {plugin.config && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Configuration</h4>
                      <div className="bg-muted p-3 rounded-md">
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(plugin.config, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  {/* Error Messages */}
                  {plugin.status.errors?.length && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-destructive">Errors</h4>
                      <div className="space-y-1">
                        {plugin.status.errors.map((error, index) => (
                          <div key={index} className="bg-destructive/10 text-destructive p-2 rounded text-sm">
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Last Updated */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Last updated: {new Date(plugin.status.lastUpdated).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {plugins.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Plugins Installed</h3>
              <p className="text-muted-foreground text-center mb-4">
                Get started by installing your first plugin to extend your blog&apos;s functionality.
              </p>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Browse Plugins
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Plugin Configuration</DialogTitle>
            <DialogDescription>
              Manage settings and configuration for your plugin.
            </DialogDescription>
          </DialogHeader>
          
          {editingPlugin && (
            <PluginConfigEditor
              plugin={editingPlugin}
              onSave={handleSaveConfig}
              onCancel={handleCancelConfig}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}