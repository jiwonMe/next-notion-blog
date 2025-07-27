import { NoxionPlugin, NoxionCoreContext, BlogPost, HookName } from '@noxion/types'
import { NotionClient } from './notion'
import { logError } from './error-handling'
import React from 'react'

export interface BlogPluginConfig {
  plugin: NoxionPlugin
  enabled: boolean
  settings: Record<string, any>
  installedVersion: string
}

export interface BlogConfig {
  blogId: string
  notionToken: string
  notionDatabaseId: string
  plugins: BlogPluginConfig[]
  settings: Record<string, any>
}

export interface PluginStatus {
  enabled: boolean
  lastUpdated: string
  errors?: string[]
}

export class MultiTenantPluginManager {
  private plugins: Map<string, NoxionPlugin> = new Map()
  private blogConfigs: Map<string, BlogConfig> = new Map()
  private notionClients: Map<string, NotionClient> = new Map()
  private routes: Map<string, Function> = new Map()
  private components: Map<string, React.ComponentType<any> | (() => Promise<React.ComponentType<any>>) | string> = new Map()
  private hooks: Map<string, Function[]> = new Map()

  constructor() {
    // Initialize with no specific blog config
  }

  /**
   * Initialize a blog with its specific configuration
   */
  async initializeBlog(blogConfig: BlogConfig): Promise<void> {
    try {
      this.blogConfigs.set(blogConfig.blogId, blogConfig)
      
      // Create Notion client for this blog
      if (blogConfig.notionToken && blogConfig.notionDatabaseId) {
        const notionClient = new NotionClient(blogConfig.notionToken, blogConfig.notionDatabaseId)
        this.notionClients.set(blogConfig.blogId, notionClient)
      }

      // Load plugins for this blog
      await this.loadBlogPlugins(blogConfig)

      // Blog initialized with plugins
    } catch (error) {
      logError(error, 'initializeBlog', { blogId: blogConfig.blogId })
      throw error
    }
  }

  /**
   * Load plugins for a specific blog
   */
  private async loadBlogPlugins(blogConfig: BlogConfig): Promise<void> {
    const blogId = blogConfig.blogId
    const notionClient = this.notionClients.get(blogId)
    
    if (!notionClient) {
      throw new Error(`No Notion client configured for blog ${blogId}`)
    }

    for (const pluginConfig of blogConfig.plugins) {
      if (!pluginConfig.enabled) continue

      try {
        const plugin = pluginConfig.plugin
        
        // Check if plugin is already registered globally
        if (!this.plugins.has(plugin.name)) {
          this.plugins.set(plugin.name, plugin)
        }

        // Create blog-specific context
        const context: NoxionCoreContext = {
          registerRoute: (path: string, handler: Function) => {
            this.registerRoute(`${blogId}:${path}`, handler)
          },
          registerComponent: (name: string, component: React.ComponentType<any> | (() => Promise<React.ComponentType<any>>) | string) => {
            this.registerComponent(`${blogId}:${name}`, component)
          },
          registerHook: (hookName: string, handler: Function) => {
            this.registerHook(`${blogId}:${hookName}`, handler)
          },
          getConfig: () => ({
            notion: {
              token: blogConfig.notionToken,
              databaseId: blogConfig.notionDatabaseId,
            },
            plugins: blogConfig.plugins.map(p => p.plugin),
            cache: blogConfig.settings.cache || { enabled: true, ttl: 300 },
          }),
          getPosts: () => notionClient.getDatabasePages(),
          getPost: (slug: string) => notionClient.getPageBySlug(slug),
        }

        // Register the plugin with blog-specific context
        await plugin.register(context)
        
        // Plugin loaded for blog
      } catch (error) {
        logError(error, 'loadBlogPlugins', { 
          blogId, 
          pluginName: pluginConfig.plugin.name 
        })
      }
    }
  }

  /**
   * Get blog configuration
   */
  getBlogConfig(blogId: string): BlogConfig | undefined {
    return this.blogConfigs.get(blogId)
  }

  /**
   * Update blog configuration
   */
  async updateBlogConfig(blogId: string, updates: Partial<BlogConfig>): Promise<void> {
    const currentConfig = this.blogConfigs.get(blogId)
    if (!currentConfig) {
      throw new Error(`Blog ${blogId} not found`)
    }

    const newConfig: BlogConfig = {
      ...currentConfig,
      ...updates,
    }

    this.blogConfigs.set(blogId, newConfig)
    
    // Reinitialize if Notion config changed
    if (updates.notionToken || updates.notionDatabaseId) {
      await this.initializeBlog(newConfig)
    }
  }

  /**
   * Register a route handler with blog context
   */
  registerRoute(path: string, handler: Function): void {
    this.routes.set(path, handler)
  }

  /**
   * Register a React component with blog context
   */
  registerComponent(name: string, component: React.ComponentType<any> | (() => Promise<React.ComponentType<any>>) | string): void {
    this.components.set(name, component)
  }

  /**
   * Register a hook handler with blog context
   */
  registerHook(hookName: string, handler: Function): void {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, [])
    }
    this.hooks.get(hookName)!.push(handler)
  }

  /**
   * Execute all handlers for a specific hook in blog context
   */
  async executeHook<T>(blogId: string, hookName: HookName, data: T): Promise<T> {
    const blogSpecificHookName = `${blogId}:${hookName}`
    const handlers = this.hooks.get(blogSpecificHookName) || []
    
    let result = data
    for (const handler of handlers) {
      try {
        result = await handler(result)
      } catch (error) {
        logError(error, 'executeHook', { 
          blogId, 
          hookName, 
          handlerIndex: handlers.indexOf(handler) 
        })
      }
    }
    
    return result
  }

  /**
   * Get a registered component by name for a specific blog
   */
  getComponent(blogId: string, name: string): React.ComponentType<any> | (() => Promise<React.ComponentType<any>>) | string | undefined {
    return this.components.get(`${blogId}:${name}`)
  }

  /**
   * Get a route handler by path for a specific blog
   */
  getRoute(blogId: string, path: string): Function | undefined {
    return this.routes.get(`${blogId}:${path}`)
  }

  /**
   * Get enhanced posts with plugin processing for a specific blog
   */
  async getEnhancedPosts(blogId: string): Promise<BlogPost[]> {
    const notionClient = this.notionClients.get(blogId)
    if (!notionClient) {
      throw new Error(`No Notion client configured for blog ${blogId}`)
    }

    const posts = await notionClient.getDatabasePages()
    return this.executeHook(blogId, 'afterPostsQuery', posts)
  }

  /**
   * Get enhanced post with plugin processing for a specific blog
   */
  async getEnhancedPost(blogId: string, slug: string): Promise<BlogPost | null> {
    const notionClient = this.notionClients.get(blogId)
    if (!notionClient) {
      throw new Error(`No Notion client configured for blog ${blogId}`)
    }

    const post = await notionClient.getPageBySlug(slug)
    if (!post) return null
    
    return this.executeHook(blogId, 'afterPostRender', post)
  }

  /**
   * Get enabled plugins for a specific blog
   */
  getBlogPlugins(blogId: string): BlogPluginConfig[] {
    const config = this.blogConfigs.get(blogId)
    return config?.plugins.filter(p => p.enabled) || []
  }

  /**
   * Enable or disable a plugin for a specific blog
   */
  async toggleBlogPlugin(blogId: string, pluginName: string, enabled: boolean): Promise<void> {
    const config = this.blogConfigs.get(blogId)
    if (!config) {
      throw new Error(`Blog ${blogId} not found`)
    }

    const plugin = config.plugins.find(p => p.plugin.name === pluginName)
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found for blog ${blogId}`)
    }

    plugin.enabled = enabled
    
    // If enabling, reinitialize the blog to load the plugin
    if (enabled) {
      await this.initializeBlog(config)
    }
    
    // Plugin state updated
  }

  /**
   * Update plugin settings for a specific blog
   */
  updateBlogPluginSettings(blogId: string, pluginName: string, settings: Record<string, any>): void {
    const config = this.blogConfigs.get(blogId)
    if (!config) {
      throw new Error(`Blog ${blogId} not found`)
    }

    const plugin = config.plugins.find(p => p.plugin.name === pluginName)
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found for blog ${blogId}`)
    }

    plugin.settings = { ...plugin.settings, ...settings }
    
    // Plugin settings updated
  }

  /**
   * Clean up blog configuration
   */
  removeBlog(blogId: string): void {
    this.blogConfigs.delete(blogId)
    this.notionClients.delete(blogId)
    
    // Clean up blog-specific routes, components, and hooks
    for (const [key] of this.routes) {
      if (key.startsWith(`${blogId}:`)) {
        this.routes.delete(key)
      }
    }
    
    for (const [key] of this.components) {
      if (key.startsWith(`${blogId}:`)) {
        this.components.delete(key)
      }
    }
    
    for (const [key] of this.hooks) {
      if (key.startsWith(`${blogId}:`)) {
        this.hooks.delete(key)
      }
    }
    
    // Blog removed from plugin manager
  }
}