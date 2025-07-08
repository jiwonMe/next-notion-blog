# @noxion/plugin-analytics

Advanced analytics and tracking plugin for Noxion blog platform.

## Features

- 📊 Page view tracking
- 🎯 Custom event tracking
- 📈 Custom dimensions support
- 🛒 E-commerce tracking (optional)
- 🐛 Debug mode for development
- ⚡ Lightweight and performant

## Installation

```bash
npm install @noxion/plugin-analytics
```

## Usage

```typescript
import { createAnalyticsPlugin } from '@noxion/plugin-analytics'

const analyticsPlugin = createAnalyticsPlugin({
  trackingId: 'GA-YOUR-TRACKING-ID',
  enablePageViews: true,
  enableEvents: true,
  debugMode: process.env.NODE_ENV === 'development',
  customDimensions: {
    'dimension1': 'blog',
    'dimension2': 'noxion'
  }
})
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `trackingId` | string | 'GA-DEMO-123' | Your analytics tracking ID |
| `enablePageViews` | boolean | true | Enable automatic page view tracking |
| `enableEvents` | boolean | false | Enable custom event tracking |
| `debugMode` | boolean | false | Enable debug logging |
| `customDimensions` | object | {} | Custom dimensions to track |
| `enableEcommerce` | boolean | false | Enable e-commerce tracking |

## Components

The plugin registers the following components:

- `AnalyticsScript` - Loads the analytics tracking script
- `AnalyticsDashboard` - Displays analytics information

## Hooks

The plugin hooks into:

- `afterPostRender` - Tracks page views when posts are rendered
- `afterPostsQuery` - Logs when post lists are queried (debug mode)

## License

MIT