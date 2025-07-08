import type { ComponentType } from 'react'

// Core Notion types
export interface NotionPageProperty {
  id: string
  type: string
  [key: string]: any
}

export interface NotionPage {
  id: string
  created_time: string
  last_edited_time: string
  cover: {
    type: string
    [key: string]: any
  } | null
  icon: {
    type: string
    [key: string]: any
  } | null
  parent: {
    type: string
    database_id: string
  }
  archived: boolean
  properties: {
    [key: string]: NotionPageProperty
  }
  url: string
  public_url: string | null
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  summary: string
  published: boolean
  date: string
  tags: string[]
  cover?: string
  content?: string
  lastEditedTime: string
  readingTime?: number
}

export interface NotionBlock {
  object: string
  id: string
  type: string
  created_time: string
  last_edited_time: string
  created_by: {
    object: string
    id: string
  }
  last_edited_by: {
    object: string
    id: string
  }
  has_children: boolean
  archived: boolean
  [key: string]: any
}

export interface NotionDatabaseQueryResponse {
  object: string
  results: NotionPage[]
  next_cursor: string | null
  has_more: boolean
}

export interface NotionBlocksResponse {
  object: string
  results: NotionBlock[]
  next_cursor: string | null
  has_more: boolean
}

// Plugin system types
export interface NoxionCoreContext {
  registerRoute: (path: string, handler: Function) => void
  registerComponent: (name: string, component: ComponentType<any> | (() => Promise<ComponentType<any>>)) => void
  registerHook: (hookName: string, handler: Function) => void
  getConfig: () => NoxionConfig
  getPosts: () => Promise<BlogPost[]>
  getPost: (slug: string) => Promise<BlogPost | null>
}

export interface NoxionPlugin {
  name: string
  version: string
  register: (core: NoxionCoreContext) => void | Promise<void>
  dependencies?: string[]
  config?: Record<string, any>
}

export interface NoxionConfig {
  notion: {
    token: string
    databaseId: string
  }
  plugins: NoxionPlugin[]
  cache?: {
    ttl?: number
    enabled?: boolean
  }
}

// Comment system types (for plugin-comments)
export interface Comment {
  id: string
  postSlug: string
  author: string
  email: string
  content: string
  createdAt: string
  updatedAt: string
  approved: boolean
  parentId?: string
  replies?: Comment[]
}

export interface CommentFormData {
  author: string
  email: string
  content: string
  postSlug: string
  parentId?: string
}

export interface CommentApiResponse {
  success: boolean
  comment?: Comment
  comments?: Comment[]
  error?: string
}

// Utility types
export type ViewMode = 'grid' | 'list'

export interface SearchResult {
  posts: BlogPost[]
  query: string
  totalCount: number
}

export interface TableOfContentsItem {
  id: string
  title: string
  level: number
  children?: TableOfContentsItem[]
}

export interface SiteMetadata {
  title: string
  description: string
  author: string
  url: string
  image?: string
  keywords?: string[]
}

// Error types
export interface NoxionError {
  code: string
  message: string
  details?: any
}

// Hook types
export type HookName = 'beforePostRender' | 'afterPostRender' | 'beforePostsQuery' | 'afterPostsQuery'

export interface HookHandler<T = any> {
  (data: T): T | Promise<T>
}

export interface HookRegistry {
  [key: string]: HookHandler[]
}