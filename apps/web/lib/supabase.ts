import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          clerk_id: string
          email: string
          name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_id: string
          email: string
          name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      blogs: {
        Row: {
          id: string
          owner_id: string
          title: string
          slug: string
          domain: string | null
          notion_database_id: string | null
          notion_token: string | null
          description: string | null
          logo_url: string | null
          settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          slug: string
          domain?: string | null
          notion_database_id?: string | null
          notion_token?: string | null
          description?: string | null
          logo_url?: string | null
          settings?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          slug?: string
          domain?: string | null
          notion_database_id?: string | null
          notion_token?: string | null
          description?: string | null
          logo_url?: string | null
          settings?: any
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          blog_id: string
          notion_page_id: string
          title: string
          slug: string
          content_md: string | null
          summary: string | null
          cover_url: string | null
          tags: string[]
          published: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          blog_id: string
          notion_page_id: string
          title: string
          slug: string
          content_md?: string | null
          summary?: string | null
          cover_url?: string | null
          tags?: string[]
          published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          blog_id?: string
          notion_page_id?: string
          title?: string
          slug?: string
          content_md?: string | null
          summary?: string | null
          cover_url?: string | null
          tags?: string[]
          published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      plugins: {
        Row: {
          id: string
          name: string
          version: string
          description: string | null
          author: string | null
          package_url: string | null
          config_schema: any
          dependencies: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          version: string
          description?: string | null
          author?: string | null
          package_url?: string | null
          config_schema?: any
          dependencies?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          version?: string
          description?: string | null
          author?: string | null
          package_url?: string | null
          config_schema?: any
          dependencies?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      blog_plugins: {
        Row: {
          blog_id: string
          plugin_id: string
          installed_version: string
          enabled: boolean
          settings: any
          installed_at: string
          updated_at: string
        }
        Insert: {
          blog_id: string
          plugin_id: string
          installed_version: string
          enabled?: boolean
          settings?: any
          installed_at?: string
          updated_at?: string
        }
        Update: {
          blog_id?: string
          plugin_id?: string
          installed_version?: string
          enabled?: boolean
          settings?: any
          installed_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          blog_id: string
          post_slug: string
          author_name: string
          author_email: string
          content: string
          approved: boolean
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          blog_id: string
          post_slug: string
          author_name: string
          author_email: string
          content: string
          approved?: boolean
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          blog_id?: string
          post_slug?: string
          author_name?: string
          author_email?: string
          content?: string
          approved?: boolean
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      analytics: {
        Row: {
          id: string
          blog_id: string
          post_slug: string | null
          event_type: string
          user_agent: string | null
          ip_address: string | null
          country: string | null
          city: string | null
          referrer: string | null
          metadata: any
          created_at: string
        }
        Insert: {
          id?: string
          blog_id: string
          post_slug?: string | null
          event_type: string
          user_agent?: string | null
          ip_address?: string | null
          country?: string | null
          city?: string | null
          referrer?: string | null
          metadata?: any
          created_at?: string
        }
        Update: {
          id?: string
          blog_id?: string
          post_slug?: string | null
          event_type?: string
          user_agent?: string | null
          ip_address?: string | null
          country?: string | null
          city?: string | null
          referrer?: string | null
          metadata?: any
          created_at?: string
        }
      }
    }
  }
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-side client with service role (for admin operations)
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Client with user auth context
export const createSupabaseClient = async () => {
  const { getToken } = await auth()
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        const clerkToken = await getToken({ template: 'supabase' })
        
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${clerkToken}`,
          },
        })
      },
    },
  })
}

// Helper functions for common operations
export const createUser = async (userData: Database['public']['Tables']['users']['Insert']) => {
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const getUserByClerkId = async (clerkId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export const getBlogBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export const getBlogsByOwner = async (ownerId: string) => {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const createBlog = async (blogData: Database['public']['Tables']['blogs']['Insert']) => {
  const { data, error } = await supabase
    .from('blogs')
    .insert(blogData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateBlog = async (id: string, updates: Database['public']['Tables']['blogs']['Update']) => {
  const { data, error } = await supabase
    .from('blogs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const getBlogPosts = async (blogId: string, published = true) => {
  let query = supabase
    .from('posts')
    .select('*')
    .eq('blog_id', blogId)
    .order('published_at', { ascending: false })
  
  if (published) {
    query = query.eq('published', true)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export const getBlogPost = async (blogId: string, slug: string) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('blog_id', blogId)
    .eq('slug', slug)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export const getInstalledPlugins = async (blogId: string) => {
  const { data, error } = await supabase
    .from('blog_plugins')
    .select(`
      *,
      plugins:plugin_id (
        name,
        version,
        description,
        author,
        package_url,
        config_schema,
        dependencies
      )
    `)
    .eq('blog_id', blogId)
    .eq('enabled', true)
  
  if (error) throw error
  return data
}

export const installPlugin = async (
  blogId: string,
  pluginId: string,
  version: string,
  settings: any = {}
) => {
  const { data, error } = await supabase
    .from('blog_plugins')
    .insert({
      blog_id: blogId,
      plugin_id: pluginId,
      installed_version: version,
      settings,
      enabled: true,
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updatePluginSettings = async (
  blogId: string,
  pluginId: string,
  settings: any
) => {
  const { data, error } = await supabase
    .from('blog_plugins')
    .update({ settings })
    .eq('blog_id', blogId)
    .eq('plugin_id', pluginId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const trackAnalytics = async (
  blogId: string,
  eventType: string,
  data: Partial<Database['public']['Tables']['analytics']['Insert']>
) => {
  const { error } = await supabase
    .from('analytics')
    .insert({
      blog_id: blogId,
      event_type: eventType,
      ...data,
    })
  
  if (error) throw error
}