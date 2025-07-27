import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createBlog, getUserByClerkId, createUser } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create user in our database
    let user = await getUserByClerkId(clerkUser.id)
    
    if (!user) {
      user = await createUser({
        clerk_id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: clerkUser.fullName || clerkUser.firstName || 'User',
        avatar_url: clerkUser.imageUrl,
      })
    }

    const { title, slug, description } = await request.json()

    // Validate input
    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      )
    }

    // Validate slug format
    if (!/^[a-zA-Z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Slug can only contain letters, numbers, and hyphens' },
        { status: 400 }
      )
    }

    // Create the blog
    const blog = await createBlog({
      owner_id: user.id,
      title,
      slug,
      description: description || null,
    })

    return NextResponse.json(blog, { status: 201 })
  } catch (error) {
    console.error('Failed to create blog:', error)
    
    if (error instanceof Error) {
      // Handle specific database errors
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'Blog slug already exists' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    )
  }
}