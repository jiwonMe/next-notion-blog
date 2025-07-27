'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Database } from '@/lib/supabase'

type Blog = Database['public']['Tables']['blogs']['Row']

interface BlogSettingsFormProps {
  blog: Blog
}

export function BlogSettingsForm({ blog }: BlogSettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const domain = formData.get('domain') as string

    try {
      const response = await fetch(`/api/dashboard/blogs/${blog.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug,
          description: description || null,
          domain: domain || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update blog')
      }

      toast.success('Blog settings updated successfully!')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update blog')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Blog Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={blog.title}
            required
            disabled={loading}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="slug">URL Slug</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={blog.slug}
            required
            disabled={loading}
            pattern="[a-zA-Z0-9-]+"
            title="Only letters, numbers, and hyphens allowed"
          />
          <p className="text-sm text-gray-500">
            Your blog will be available at /{blog.slug}
          </p>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={blog.description || ''}
            disabled={loading}
            rows={3}
            placeholder="A brief description of your blog..."
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="domain">Custom Domain (Optional)</Label>
          <Input
            id="domain"
            name="domain"
            defaultValue={blog.domain || ''}
            disabled={loading}
            placeholder="yourblog.com"
            type="url"
          />
          <p className="text-sm text-gray-500">
            Configure a custom domain for your blog
          </p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </form>
  )
}