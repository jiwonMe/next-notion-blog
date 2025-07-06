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