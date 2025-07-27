import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { updateBlog, getBlogsByOwner, getUserByClerkId } from '@/lib/supabase'

export async function PATCH(
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

    const updates = await request.json()

    // Validate slug format if provided
    if (updates.slug && !/^[a-zA-Z0-9-]+$/.test(updates.slug)) {
      return NextResponse.json(
        { error: 'Slug can only contain letters, numbers, and hyphens' },
        { status: 400 }
      )
    }

    const updatedBlog = await updateBlog(params.id, updates)

    return NextResponse.json(updatedBlog)
  } catch (error) {
    console.error('Failed to update blog:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'Blog slug already exists' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to update blog' },
      { status: 500 }
    )
  }
}