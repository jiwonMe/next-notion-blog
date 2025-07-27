import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserByClerkId, getBlogsByOwner, supabase } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; pluginId: string } }
) {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserByClerkId(clerkUser.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user owns the blog
    const blogs = await getBlogsByOwner(user.id)
    const blog = blogs.find(b => b.id === params.id)
    
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    const { enabled, settings } = await request.json()

    const updates: any = {}
    if (typeof enabled === 'boolean') {
      updates.enabled = enabled
    }
    if (settings) {
      updates.settings = settings
    }

    const { data, error } = await supabase
      .from('blog_plugins')
      .update(updates)
      .eq('blog_id', params.id)
      .eq('plugin_id', params.pluginId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to update plugin:', error)
    return NextResponse.json(
      { error: 'Failed to update plugin' },
      { status: 500 }
    )
  }
}