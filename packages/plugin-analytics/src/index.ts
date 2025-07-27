import { NoxionPlugin, BlogPost } from '@noxion/types'

export interface AnalyticsConfig {
  trackingId: string
  enablePageViews: boolean
  enableEvents: boolean
  debugMode: boolean
  customDimensions?: Record<string, string>
  enableEcommerce?: boolean
}

export const createAnalyticsPlugin = (config: Partial<AnalyticsConfig> = {}): NoxionPlugin => {
  const defaultConfig: AnalyticsConfig = {
    trackingId: 'GA-DEMO-123',
    enablePageViews: true,
    enableEvents: false,
    debugMode: false,
    customDimensions: {},
    enableEcommerce: false,
    ...config
  }

  return {
    name: 'analytics',
    version: '1.0.0',
    description: 'Advanced analytics and tracking plugin for blog posts and user interactions',
    author: 'Noxion Team',
    config: defaultConfig,
    
    async register(context) {
      // Analytics plugin registration
      
      // Register page view tracking hook
      context.registerHook('afterPostRender', async (post: BlogPost) => {
        if (defaultConfig.enablePageViews) {
          await trackPageView(post, defaultConfig)
        }
        return post
      })
      
      // Register posts list tracking hook
      context.registerHook('afterPostsQuery', async (posts: BlogPost[]) => {
        // Analytics: Posts list queried
        return posts
      })
      
      // Register analytics script component
      context.registerComponent('AnalyticsScript', createAnalyticsScriptComponent(defaultConfig))
      
      // Register analytics dashboard component
      context.registerComponent('AnalyticsDashboard', createAnalyticsDashboardComponent(defaultConfig))
    }
  }
}

async function trackPageView(post: BlogPost, config: AnalyticsConfig): Promise<void> {
  // Analytics: Page view tracked for post
  
  // In a real implementation, this would send data to your analytics service
  // For example: Google Analytics, Plausible, etc.
}

function createAnalyticsScriptComponent(config: AnalyticsConfig): any {
  return function AnalyticsScript() {
    if (typeof window === 'undefined') return null
    
    return {
      type: 'script',
      props: {
        id: 'analytics-script',
        dangerouslySetInnerHTML: {
          __html: `
            // Analytics script initialized
            // Analytics initialization code would go here
          `
        }
      }
    }
  }
}

function createAnalyticsDashboardComponent(config: AnalyticsConfig): any {
  return function AnalyticsDashboard() {
    return {
      type: 'div',
      props: {
        className: 'analytics-dashboard p-4 border rounded',
        children: [
          {
            type: 'h3',
            props: { children: 'Analytics Dashboard' }
          },
          {
            type: 'p',
            props: { children: `Tracking ID: ${config.trackingId}` }
          },
          {
            type: 'p',
            props: { children: `Page Views: ${config.enablePageViews ? 'Enabled' : 'Disabled'}` }
          },
          {
            type: 'p',
            props: { children: `Events: ${config.enableEvents ? 'Enabled' : 'Disabled'}` }
          }
        ]
      }
    }
  }
}

export default createAnalyticsPlugin