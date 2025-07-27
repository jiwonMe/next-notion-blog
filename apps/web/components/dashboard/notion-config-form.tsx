'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save, Database as DatabaseIcon, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Database } from '@/lib/supabase'

type Blog = Database['public']['Tables']['blogs']['Row']

interface NotionConfigFormProps {
  blog: Blog
}

export function NotionConfigForm({ blog }: NotionConfigFormProps) {
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const notionToken = formData.get('notion_token') as string
    const notionDatabaseId = formData.get('notion_database_id') as string

    try {
      const response = await fetch(`/api/dashboard/blogs/${blog.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notion_token: notionToken,
          notion_database_id: notionDatabaseId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update Notion configuration')
      }

      toast.success('Notion configuration updated successfully!')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update Notion configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    
    const form = document.getElementById('notion-form') as HTMLFormElement
    const formData = new FormData(form)
    const notionToken = formData.get('notion_token') as string
    const notionDatabaseId = formData.get('notion_database_id') as string

    try {
      const response = await fetch(`/api/dashboard/blogs/${blog.id}/test-notion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notion_token: notionToken,
          notion_database_id: notionDatabaseId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to test Notion connection')
      }

      const result = await response.json()
      toast.success(`Connection successful! Found ${result.postsCount} posts.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to test Notion connection')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Help Text */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Setting up Notion Integration
        </h3>
        <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>1. Create a new integration in your Notion workspace</li>
          <li>2. Copy the integration token (starts with "secret_")</li>
          <li>3. Share your database with the integration</li>
          <li>4. Copy the database ID from the URL</li>
        </ol>
        <a 
          href="https://developers.notion.com/docs/getting-started"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 mt-2"
        >
          <ExternalLink className="h-3 w-3" />
          <span className="text-sm">View Notion API Documentation</span>
        </a>
      </div>

      <form id="notion-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="notion_token">Notion Integration Token</Label>
            <Input
              id="notion_token"
              name="notion_token"
              type="password"
              placeholder="secret_..."
              defaultValue={blog.notion_token || ''}
              required
              disabled={loading}
            />
            <p className="text-sm text-gray-500">
              Your Notion integration token (keep this secure)
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="notion_database_id">Database ID</Label>
            <Input
              id="notion_database_id"
              name="notion_database_id"
              placeholder="32-character database ID"
              defaultValue={blog.notion_database_id || ''}
              required
              disabled={loading}
            />
            <p className="text-sm text-gray-500">
              The ID of your Notion database (found in the URL)
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={handleTestConnection} disabled={testing || loading}>
            {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <DatabaseIcon className="mr-2 h-4 w-4" />
            Test Connection
          </Button>
          
          <Button type="submit" disabled={loading || testing}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  )
}