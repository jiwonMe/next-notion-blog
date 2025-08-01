import { NoxionPlugin, NoxionCoreContext, NoxionConfig, BlogPost, HookName } from '@noxion/types'
import { NotionClient } from './notion'
import { logError } from './error-handling'
import React from 'react'

export interface PluginStatus {
  enabled: boolean
  lastUpdated: string
  errors?: string[]
}

export class PluginManager {
  private plugins: Map<string, NoxionPlugin> = new Map()
  private pluginStatus: Map<string, PluginStatus> = new Map()
  private routes: Map<string, Function> = new Map()
  private components: Map<string, React.ComponentType<any> | (() => Promise<React.ComponentType<any>>) | string> = new Map()
  private hooks: Map<string, Function[]> = new Map()
  private notionClient: NotionClient
  private config: NoxionConfig

  constructor(config: NoxionConfig) {
    this.config = config
    this.notionClient = new NotionClient(config.notion.token, config.notion.databaseId)
  }

  /**
   * Register a plugin with the manager
   */
  async registerPlugin(plugin: NoxionPlugin): Promise<void> {
    try {
      // Check if plugin is already registered
      if (this.plugins.has(plugin.name)) {
        logError(new Error(`Plugin ${plugin.name} is already registered`), 'registerPlugin')
        return
      }

      // Check dependencies
      if (plugin.dependencies) {
        for (const dep of plugin.dependencies) {
          if (!this.plugins.has(dep)) {
            throw new Error(`Plugin ${plugin.name} depends on ${dep} which is not registered`)
          }
        }
      }

      // Create context for the plugin
      const context: NoxionCoreContext = {
        registerRoute: this.registerRoute.bind(this),
        registerComponent: this.registerComponent.bind(this),
        registerHook: this.registerHook.bind(this),
        getConfig: () => this.config,
        getPosts: () => this.notionClient.getDatabasePages(),
        getPost: (slug: string) => this.notionClient.getPageBySlug(slug),
      }

      // Register the plugin
      await plugin.register(context)
      this.plugins.set(plugin.name, plugin)
      
      // Initialize plugin status as enabled
      this.pluginStatus.set(plugin.name, {
        enabled: true,
        lastUpdated: new Date().toISOString(),
      })

      // Plugin registered successfully
    } catch (error) {
      logError(error, 'registerPlugin', { pluginName: plugin.name })
      throw error
    }
  }

  /**
   * Unregister a plugin
   */
  unregisterPlugin(name: string): void {
    this.plugins.delete(name)
    this.pluginStatus.delete(name)
    // TODO: Clean up routes, components, and hooks registered by this plugin
  }

  /**
   * Enable or disable a plugin
   */
  setPluginEnabled(name: string, enabled: boolean): boolean {
    const plugin = this.plugins.get(name)
    if (!plugin) {
      return false
    }
    
    const currentStatus = this.pluginStatus.get(name) || {
      enabled: true,
      lastUpdated: new Date().toISOString(),
    }
    this.pluginStatus.set(name, {
      ...currentStatus,
      enabled,
      lastUpdated: new Date().toISOString(),
    })
    
    // Plugin state updated
    return true
  }

  /**
   * Get plugin status
   */
  getPluginStatus(name: string): PluginStatus | undefined {
    return this.pluginStatus.get(name)
  }

  /**
   * Get all plugin statuses
   */
  getAllPluginStatuses(): Map<string, PluginStatus> {
    return new Map(this.pluginStatus)
  }

  /**
   * Update plugin configuration
   */
  updatePluginConfig(name: string, config: any): boolean {
    const plugin = this.plugins.get(name)
    if (!plugin) {
      return false
    }
    
    // Update the plugin config
    plugin.config = { ...plugin.config, ...config }
    
    // Update status
    const currentStatus = this.pluginStatus.get(name) || {
      enabled: true,
      lastUpdated: new Date().toISOString(),
    }
    this.pluginStatus.set(name, {
      ...currentStatus,
      lastUpdated: new Date().toISOString(),
    })
    
    // Plugin configuration updated
    return true
  }

  /**
   * Register a route handler
   */
  registerRoute(path: string, handler: Function): void {
    this.routes.set(path, handler)
  }

  /**
   * Register a React component (can be static, lazy-loaded, or an import path)
   */
  registerComponent(name: string, component: React.ComponentType<any> | (() => Promise<React.ComponentType<any>>) | string): void {
    this.components.set(name, component)
  }

  /**
   * Register a hook handler
   */
  registerHook(hookName: string, handler: Function): void {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, [])
    }
    this.hooks.get(hookName)!.push(handler)
  }

  /**
   * Execute all handlers for a specific hook (only for enabled plugins)
   */
  async executeHook<T>(hookName: HookName, data: T): Promise<T> {
    const handlers = this.hooks.get(hookName) || []
    
    let result = data
    for (const handler of handlers) {
      try {
        // Only execute hooks for enabled plugins
        // Note: We'd need to track which plugin registered which hook for better filtering
        result = await handler(result)
      } catch (error) {
        logError(error, 'executeHook', { hookName, handlerIndex: handlers.indexOf(handler) })
      }
    }
    
    return result
  }

  /**
   * Get a registered component by name (can be static, lazy-loaded, or import path)
   */
  getComponent(name: string): React.ComponentType<any> | (() => Promise<React.ComponentType<any>>) | string | undefined {
    return this.components.get(name)
  }

  /**
   * Get a route handler by path
   */
  getRoute(path: string): Function | undefined {
    return this.routes.get(path)
  }

  /**
   * Get all registered plugins
   */
  getPlugins(): NoxionPlugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Get plugin by name
   */
  getPlugin(name: string): NoxionPlugin | undefined {
    return this.plugins.get(name)
  }

  /**
   * Initialize all plugins
   */
  async initializePlugins(): Promise<void> {
    for (const plugin of this.config.plugins) {
      await this.registerPlugin(plugin)
    }
  }

  /**
   * Get enhanced posts with plugin processing
   */
  async getEnhancedPosts(): Promise<BlogPost[]> {
    const posts = await this.notionClient.getDatabasePages()
    return this.executeHook('afterPostsQuery', posts)
  }

  /**
   * Get enhanced post with plugin processing
   */
  async getEnhancedPost(slug: string): Promise<BlogPost | null> {
    const post = await this.notionClient.getPageBySlug(slug)
    if (!post) return null
    
    return this.executeHook('afterPostRender', post)
  }
}