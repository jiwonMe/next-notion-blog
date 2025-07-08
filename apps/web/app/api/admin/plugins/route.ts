import { NextRequest, NextResponse } from 'next/server'
import { noxion } from '@/lib/noxion'

export async function GET() {
  try {
    const plugins = noxion.getPlugins()
    const statuses = noxion.getAllPluginStatuses()
    
    const pluginsWithStatus = plugins.map(plugin => ({
      ...plugin,
      status: statuses.get(plugin.name) || {
        enabled: true,
        lastUpdated: new Date().toISOString(),
      }
    }))
    
    return NextResponse.json({ plugins: pluginsWithStatus })
  } catch (error) {
    console.error('Failed to get plugins:', error)
    return NextResponse.json(
      { error: 'Failed to get plugins' },
      { status: 500 }
    )
  }
}