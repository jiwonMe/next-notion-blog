/**
 * Standardized error handling utilities
 */

export interface AppError {
  message: string
  code?: string
  originalError?: unknown
  timestamp: Date
}

export class NotionAPIError extends Error implements AppError {
  code: string
  originalError?: unknown
  timestamp: Date

  constructor(message: string, code: string = 'NOTION_API_ERROR', originalError?: unknown) {
    super(message)
    this.name = 'NotionAPIError'
    this.code = code
    this.originalError = originalError
    this.timestamp = new Date()
  }
}

export class DataValidationError extends Error implements AppError {
  code: string
  originalError?: unknown
  timestamp: Date

  constructor(message: string, code: string = 'DATA_VALIDATION_ERROR', originalError?: unknown) {
    super(message)
    this.name = 'DataValidationError'
    this.code = code
    this.originalError = originalError
    this.timestamp = new Date()
  }
}

/**
 * Safely handles async operations with proper error logging and graceful fallbacks
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback: T,
  context: string
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    console.error(`Error in ${context}:`, error)
    return fallback
  }
}

/**
 * Safely handles async operations that can throw, returning either result or error
 */
export async function safeAsyncResult<T>(
  operation: () => Promise<T>,
  context: string
): Promise<{ success: true; data: T } | { success: false; error: AppError }> {
  try {
    const data = await operation()
    return { success: true, data }
  } catch (error) {
    console.error(`Error in ${context}:`, error)
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
        originalError: error,
        timestamp: new Date()
      }
    }
  }
}

/**
 * Logs errors in a consistent format
 */
export function logError(error: unknown, context: string, additionalInfo?: Record<string, unknown>) {
  const errorInfo = {
    context,
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error,
    ...additionalInfo
  }

  console.error('Application Error:', JSON.stringify(errorInfo, null, 2))
}

/**
 * Creates a user-friendly error message from any error
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof NotionAPIError) {
    return 'Unable to load content from Notion. Please try again later.'
  }
  
  if (error instanceof DataValidationError) {
    return 'The content format is invalid. Please check the source.'
  }
  
  if (error instanceof Error) {
    // Don't expose internal error messages to users in production
    if (process.env.NODE_ENV === 'production') {
      return 'Something went wrong. Please try again later.'
    }
    return error.message
  }
  
  return 'An unexpected error occurred. Please try again later.'
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'timestamp' in error
  )
}