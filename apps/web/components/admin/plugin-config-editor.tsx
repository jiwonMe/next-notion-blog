'use client'

import { useState } from 'react'
import { SerializablePlugin } from '@noxion/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Save, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PluginConfigEditorProps {
  plugin: SerializablePlugin
  onSave: (config: any) => void
  onCancel: () => void
}

export function PluginConfigEditor({ plugin, onSave, onCancel }: PluginConfigEditorProps) {
  const [config, setConfig] = useState(plugin.config || {})
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)

  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(config)
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save config:', error)
    } finally {
      setSaving(false)
    }
  }

  const renderConfigField = (key: string, value: any, type?: string) => {
    switch (type || typeof value) {
      case 'boolean':
        return (
          <div key={key} className="flex items-center justify-between">
            <Label htmlFor={key} className="text-sm font-medium">
              {key}
            </Label>
            <Switch
              id={key}
              checked={config[key] ?? value}
              onCheckedChange={(checked) => updateConfig(key, checked)}
            />
          </div>
        )

      case 'string':
        if (key.toLowerCase().includes('url') || key.toLowerCase().includes('endpoint')) {
          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="text-sm font-medium">
                {key}
              </Label>
              <Input
                id={key}
                type="url"
                value={config[key] ?? value}
                onChange={(e) => updateConfig(key, e.target.value)}
                placeholder={`Enter ${key}`}
              />
            </div>
          )
        }
        
        if (key.toLowerCase().includes('key') || key.toLowerCase().includes('token') || key.toLowerCase().includes('secret')) {
          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="text-sm font-medium">
                {key} <Badge variant="secondary" className="ml-2">Sensitive</Badge>
              </Label>
              <Input
                id={key}
                type="password"
                value={config[key] ?? value}
                onChange={(e) => updateConfig(key, e.target.value)}
                placeholder={`Enter ${key}`}
              />
            </div>
          )
        }

        if (String(value).length > 50) {
          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="text-sm font-medium">
                {key}
              </Label>
              <Textarea
                id={key}
                value={config[key] ?? value}
                onChange={(e) => updateConfig(key, e.target.value)}
                placeholder={`Enter ${key}`}
                rows={3}
              />
            </div>
          )
        }

        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium">
              {key}
            </Label>
            <Input
              id={key}
              value={config[key] ?? value}
              onChange={(e) => updateConfig(key, e.target.value)}
              placeholder={`Enter ${key}`}
            />
          </div>
        )

      case 'number':
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium">
              {key}
            </Label>
            <Input
              id={key}
              type="number"
              value={config[key] ?? value}
              onChange={(e) => updateConfig(key, Number(e.target.value))}
              placeholder={`Enter ${key}`}
            />
          </div>
        )

      case 'object':
      case 'array':
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium">
              {key} <Badge variant="outline">JSON</Badge>
            </Label>
            <Textarea
              id={key}
              value={JSON.stringify(config[key] ?? value, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  updateConfig(key, parsed)
                } catch {
                  // Invalid JSON, don't update
                }
              }}
              placeholder={`Enter ${key} as JSON`}
              rows={4}
              className="font-mono text-xs"
            />
          </div>
        )

      default:
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium">
              {key}
            </Label>
            <Input
              id={key}
              value={String(config[key] ?? value)}
              onChange={(e) => updateConfig(key, e.target.value)}
              placeholder={`Enter ${key}`}
            />
          </div>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>Configure {plugin.name}</span>
              {hasChanges && <Badge variant="outline">Unsaved Changes</Badge>}
            </CardTitle>
            <CardDescription>
              Manage settings and configuration for this plugin
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || saving}
              className={cn(
                hasChanges && "bg-primary text-primary-foreground"
              )}
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Plugin Info */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Plugin Information</h3>
          <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
            <div><span className="font-medium">Name:</span> {plugin.name}</div>
            <div><span className="font-medium">Version:</span> {plugin.version}</div>
            {plugin.dependencies && (
              <div><span className="font-medium">Dependencies:</span> {plugin.dependencies.join(', ')}</div>
            )}
          </div>
        </div>

        <Separator />

        {/* Configuration Fields */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Configuration</h3>
          
          {Object.keys(plugin.config || {}).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(plugin.config || {}).map(([key, value]) => 
                renderConfigField(key, value)
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>No configuration options available for this plugin.</p>
            </div>
          )}
        </div>

        {/* Raw JSON Editor */}
        <Separator />
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Raw Configuration (Advanced)</h3>
          <Textarea
            value={JSON.stringify(config, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                setConfig(parsed)
                setHasChanges(true)
              } catch {
                // Invalid JSON, don't update
              }
            }}
            placeholder="Plugin configuration as JSON"
            rows={8}
            className="font-mono text-xs"
          />
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-3 w-3" />
            <span>Direct JSON editing may break plugin functionality. Use with caution.</span>
          </div>
        </div>

        {/* Save Status */}
        {!hasChanges && !saving && (
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Configuration is up to date</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}