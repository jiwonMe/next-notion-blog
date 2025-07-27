import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserByClerkId, getBlogsByOwner } from '@/lib/supabase'
import { NotionClient } from '@noxion/core'

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

    const { notion_token, notion_database_id } = await request.json()

    if (!notion_token || !notion_database_id) {
      return NextResponse.json(
        { error: 'Notion token and database ID are required' },
        { status: 400 }
      )
    }

    try {
      const notionClient = new NotionClient(notion_token, notion_database_id)
      const posts = await notionClient.getDatabasePages()
      
      return NextResponse.json({
        success: true,
        postsCount: posts.length,
        message: 'Connection successful!',
      })
    } catch (notionError) {
      console.error('Notion API error:', notionError)
      return NextResponse.json(
        { error: 'Failed to connect to Notion. Please check your token and database ID.' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Failed to test Notion connection:', error)
    return NextResponse.json(
      { error: 'Failed to test connection' },
      { status: 500 }
    )
  }
}