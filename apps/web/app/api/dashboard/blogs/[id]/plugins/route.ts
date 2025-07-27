import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserByClerkId, getBlogsByOwner, getInstalledPlugins, installPlugin, supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const plugins = await getInstalledPlugins(params.id)
    return NextResponse.json(plugins)
  } catch (error) {
    console.error('Failed to fetch blog plugins:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plugins' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { plugin_id } = await request.json()

    if (!plugin_id) {
      return NextResponse.json({ error: 'Plugin ID is required' }, { status: 400 })
    }

    // Get plugin info to get version
    const { data: plugin, error: pluginError } = await supabase
      .from('plugins')
      .select('version')
      .eq('id', plugin_id)
      .single()

    if (pluginError || !plugin) {
      return NextResponse.json({ error: 'Plugin not found' }, { status: 404 })
    }

    const installedPlugin = await installPlugin(params.id, plugin_id, plugin.version)
    return NextResponse.json(installedPlugin, { status: 201 })
  } catch (error) {
    console.error('Failed to install plugin:', error)
    
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Plugin is already installed' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to install plugin' },
      { status: 500 }
    )
  }
}