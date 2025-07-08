import { PluginDashboard } from '@/components/admin/plugin-dashboard'
import { generateMetadata } from '@/lib/metadata'
import { pluginManager } from '@/lib/noxion'

export const metadata = generateMetadata({
  title: 'Plugin Dashboard - Admin',
  description: 'Manage installed plugins and their configurations',
})

export default function PluginDashboardPage() {
  // Get plugins for initial render and serialize only needed data
  const plugins = pluginManager.getPlugins()
  const serializedPlugins = plugins.map(plugin => ({
    name: plugin.name,
    version: plugin.version,
    description: plugin.description,
    author: plugin.author,
    dependencies: plugin.dependencies,
    config: plugin.config,
  }))
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Plugin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your installed plugins and their configurations
        </p>
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm">Loaded plugins: {plugins.length}</p>
          <ul className="text-sm mt-2">
            {plugins.map(plugin => (
              <li key={plugin.name}>• {plugin.name} v{plugin.version}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <PluginDashboard plugins={serializedPlugins} />
    </div>
  )
}