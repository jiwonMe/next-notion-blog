import { BlogPost, NotionPage, NotionDatabaseQueryResponse } from '@/types/notion'
import { DataValidationError } from './error-handling'

/**
 * Type guards and validation utilities for Notion API responses
 */

/**
 * Validates if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Validates if a value is a valid date string
 */
export function isValidDateString(value: unknown): value is string {
  if (!isNonEmptyString(value)) return false
  const date = new Date(value)
  return !isNaN(date.getTime())
}

/**
 * Validates if a value is a valid URL
 */
export function isValidUrl(value: unknown): value is string {
  if (!isNonEmptyString(value)) return false
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

/**
 * Validates if a value is an array of strings
 */
export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

/**
 * Validates Notion page property structure
 */
export function validateNotionProperty(property: unknown): boolean {
  if (!property || typeof property !== 'object') return false
  
  const prop = property as any
  return (
    typeof prop.id === 'string' &&
    typeof prop.type === 'string'
  )
}

/**
 * Validates Notion page structure
 */
export function validateNotionPage(page: unknown): page is NotionPage {
  if (!page || typeof page !== 'object') return false
  
  const p = page as any
  return (
    typeof p.id === 'string' &&
    typeof p.created_time === 'string' &&
    typeof p.last_edited_time === 'string' &&
    typeof p.archived === 'boolean' &&
    typeof p.properties === 'object' &&
    p.properties !== null
  )
}

/**
 * Validates Notion database query response
 */
export function validateDatabaseResponse(response: unknown): response is NotionDatabaseQueryResponse {
  if (!response || typeof response !== 'object') return false
  
  const r = response as any
  return (
    r.object === 'list' &&
    Array.isArray(r.results) &&
    r.results.every(validateNotionPage) &&
    typeof r.has_more === 'boolean'
  )
}

/**
 * Validates blog post data structure
 */
export function validateBlogPost(post: unknown): post is BlogPost {
  if (!post || typeof post !== 'object') return false
  
  const p = post as any
  return (
    isNonEmptyString(p.id) &&
    isNonEmptyString(p.title) &&
    isNonEmptyString(p.slug) &&
    typeof p.published === 'boolean' &&
    isValidDateString(p.date) &&
    isValidDateString(p.lastEditedTime) &&
    isStringArray(p.tags) &&
    typeof p.summary === 'string' &&
    typeof p.content === 'string' &&
    (p.readingTime === undefined || typeof p.readingTime === 'number') &&
    (p.cover === undefined || isValidUrl(p.cover))
  )
}

/**
 * Sanitizes and validates a string property
 */
export function sanitizeString(value: unknown, defaultValue: string = ''): string {
  if (typeof value === 'string') {
    return value.trim()
  }
  return defaultValue
}

/**
 * Sanitizes and validates a boolean property
 */
export function sanitizeBoolean(value: unknown, defaultValue: boolean = false): boolean {
  if (typeof value === 'boolean') {
    return value
  }
  return defaultValue
}

/**
 * Sanitizes and validates a number property
 */
export function sanitizeNumber(value: unknown, defaultValue: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    if (!isNaN(parsed)) {
      return parsed
    }
  }
  return defaultValue
}

/**
 * Sanitizes and validates an array property
 */
export function sanitizeArray<T>(
  value: unknown,
  itemValidator: (item: unknown) => item is T,
  defaultValue: T[] = []
): T[] {
  if (Array.isArray(value)) {
    return value.filter(itemValidator)
  }
  return defaultValue
}

/**
 * Sanitizes and validates a date string
 */
export function sanitizeDate(value: unknown, defaultValue?: string): string {
  if (isValidDateString(value)) {
    return value
  }
  if (defaultValue && isValidDateString(defaultValue)) {
    return defaultValue
  }
  return new Date().toISOString()
}

/**
 * Sanitizes and validates a URL
 */
export function sanitizeUrl(value: unknown): string | undefined {
  if (isValidUrl(value)) {
    return value
  }
  return undefined
}

/**
 * Creates a safe blog post from potentially invalid data
 */
export function createSafeBlogPost(data: any): BlogPost {
  const safeBlogPost: BlogPost = {
    id: sanitizeString(data.id, 'unknown'),
    title: sanitizeString(data.title, 'Untitled'),
    slug: sanitizeString(data.slug, 'untitled'),
    summary: sanitizeString(data.summary),
    published: sanitizeBoolean(data.published),
    date: sanitizeDate(data.date),
    tags: sanitizeArray(data.tags, (item): item is string => typeof item === 'string'),
    cover: sanitizeUrl(data.cover),
    content: sanitizeString(data.content),
    lastEditedTime: sanitizeDate(data.lastEditedTime),
    readingTime: sanitizeNumber(data.readingTime, 1),
  }

  // Validate the created post
  if (!validateBlogPost(safeBlogPost)) {
    throw new DataValidationError(
      `Invalid blog post data structure for post: ${(data as any)?.title || 'unknown'}`,
      'INVALID_BLOG_POST',
      data
    )
  }

  return safeBlogPost
}

/**
 * Validates and throws error if Notion response is invalid
 */
export function validateNotionResponse<T>(
  response: unknown,
  validator: (data: unknown) => data is T,
  context: string
): T {
  if (!validator(response)) {
    throw new DataValidationError(
      `Invalid Notion API response structure in ${context}`,
      'INVALID_NOTION_RESPONSE',
      response
    )
  }
  return response
}

/**
 * Creates a type-safe wrapper for Notion property access
 */
export class NotionPropertyAccessor {
  constructor(private properties: Record<string, any>) {}

  getString(key: string, defaultValue: string = ''): string {
    const prop = this.properties[key]
    if (!prop) return defaultValue

    switch (prop.type) {
      case 'title':
        return this.getPlainText(prop.title, defaultValue)
      case 'rich_text':
        return this.getPlainText(prop.rich_text, defaultValue)
      case 'select':
        return prop.select?.name || defaultValue
      case 'url':
        return prop.url || defaultValue
      case 'email':
        return prop.email || defaultValue
      case 'phone_number':
        return prop.phone_number || defaultValue
      default:
        return defaultValue
    }
  }

  getBoolean(key: string, defaultValue: boolean = false): boolean {
    const prop = this.properties[key]
    if (!prop) return defaultValue

    switch (prop.type) {
      case 'checkbox':
        return prop.checkbox || defaultValue
      default:
        return defaultValue
    }
  }

  getNumber(key: string, defaultValue: number = 0): number {
    const prop = this.properties[key]
    if (!prop) return defaultValue

    switch (prop.type) {
      case 'number':
        return prop.number || defaultValue
      default:
        return defaultValue
    }
  }

  getStringArray(key: string, defaultValue: string[] = []): string[] {
    const prop = this.properties[key]
    if (!prop) return defaultValue

    switch (prop.type) {
      case 'multi_select':
        return prop.multi_select?.map((item: any) => item.name) || defaultValue
      case 'rich_text':
        const text = this.getPlainText(prop.rich_text)
        return text ? [text] : defaultValue
      case 'title':
        const title = this.getPlainText(prop.title)
        return title ? [title] : defaultValue
      default:
        return defaultValue
    }
  }

  getDate(key: string, defaultValue?: string): string {
    const prop = this.properties[key]
    if (!prop) return defaultValue || new Date().toISOString()

    switch (prop.type) {
      case 'date':
        return prop.date?.start || defaultValue || new Date().toISOString()
      case 'created_time':
        return prop.created_time || defaultValue || new Date().toISOString()
      case 'last_edited_time':
        return prop.last_edited_time || defaultValue || new Date().toISOString()
      default:
        return defaultValue || new Date().toISOString()
    }
  }

  private getPlainText(richText: any[], defaultValue: string = ''): string {
    if (!Array.isArray(richText)) return defaultValue
    return richText
      .map((text) => text.plain_text || '')
      .join('')
      .trim() || defaultValue
  }
}