'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Loader2, Download, Settings, Plug } from 'lucide-react'
import { toast } from 'sonner'

interface Plugin {
  id: string
  name: string
  version: string
  description: string
  author: string
  dependencies: string[]
}

interface InstalledPlugin {
  plugin_id: string
  installed_version: string
  enabled: boolean
  settings: any
  plugin: Plugin
}

interface PluginManagerProps {
  blogId: string
}

export function PluginManager({ blogId }: PluginManagerProps) {
  const [availablePlugins, setAvailablePlugins] = useState<Plugin[]>([])
  const [installedPlugins, setInstalledPlugins] = useState<InstalledPlugin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlugins()
  }, [blogId])

  const fetchPlugins = async () => {
    try {
      const [availableRes, installedRes] = await Promise.all([
        fetch('/api/dashboard/plugins'),
        fetch(`/api/dashboard/blogs/${blogId}/plugins`),
      ])

      if (!availableRes.ok || !installedRes.ok) {
        throw new Error('Failed to fetch plugins')
      }

      const [available, installed] = await Promise.all([
        availableRes.json(),
        installedRes.json(),
      ])

      setAvailablePlugins(available)
      setInstalledPlugins(installed)
    } catch (error) {
      toast.error('Failed to load plugins')
    } finally {
      setLoading(false)
    }
  }

  const handleInstallPlugin = async (pluginId: string) => {
    try {
      const response = await fetch(`/api/dashboard/blogs/${blogId}/plugins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plugin_id: pluginId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to install plugin')
      }

      toast.success('Plugin installed successfully!')
      fetchPlugins()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to install plugin')
    }
  }

  const handleTogglePlugin = async (pluginId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/dashboard/blogs/${blogId}/plugins/${pluginId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update plugin')
      }

      toast.success(`Plugin ${enabled ? 'enabled' : 'disabled'} successfully!`)
      fetchPlugins()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update plugin')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const installedPluginIds = new Set(installedPlugins.map(p => p.plugin_id))

  return (
    <div className="space-y-6">
      {/* Installed Plugins */}
      {installedPlugins.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Installed Plugins</h3>
          <div className="grid gap-4">
            {installedPlugins.map((installedPlugin) => (
              <Card key={installedPlugin.plugin_id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{installedPlugin.plugin.name}</CardTitle>
                      <CardDescription>{installedPlugin.plugin.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">
                        v{installedPlugin.installed_version}
                      </Badge>
                      <Switch
                        checked={installedPlugin.enabled}
                        onCheckedChange={(enabled) => 
                          handleTogglePlugin(installedPlugin.plugin_id, enabled)
                        }
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      by {installedPlugin.plugin.author}
                    </span>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Plugins */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Plugins</h3>
        <div className="grid gap-4">
          {availablePlugins
            .filter(plugin => !installedPluginIds.has(plugin.id))
            .map((plugin) => (
              <Card key={plugin.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{plugin.name}</CardTitle>
                      <CardDescription>{plugin.description}</CardDescription>
                    </div>
                    <Badge variant="outline">v{plugin.version}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      by {plugin.author}
                    </span>
                    <Button
                      onClick={() => handleInstallPlugin(plugin.id)}
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Install
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {availablePlugins.length === 0 && (
        <div className="text-center py-8">
          <Plug className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No plugins available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Check back later for new plugins to enhance your blog
          </p>
        </div>
      )}
    </div>
  )
}