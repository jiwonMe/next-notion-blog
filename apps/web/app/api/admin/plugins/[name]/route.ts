import { NextRequest, NextResponse } from 'next/server'
import { noxion } from '@/lib/noxion'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const { name } = params
    const body = await request.json()
    
    if (body.enabled !== undefined) {
      const success = noxion.setPluginEnabled(name, body.enabled)
      if (!success) {
        return NextResponse.json(
          { error: 'Plugin not found' },
          { status: 404 }
        )
      }
    }
    
    if (body.config !== undefined) {
      const success = noxion.updatePluginConfig(name, body.config)
      if (!success) {
        return NextResponse.json(
          { error: 'Plugin not found' },
          { status: 404 }
        )
      }
    }
    
    const plugin = noxion.getPlugin(name)
    const status = noxion.getPluginStatus(name)
    
    return NextResponse.json({
      plugin: {
        ...plugin,
        status
      }
    })
  } catch (error) {
    console.error('Failed to update plugin:', error)
    return NextResponse.json(
      { error: 'Failed to update plugin' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const { name } = params
    
    noxion.unregisterPlugin(name)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to remove plugin:', error)
    return NextResponse.json(
      { error: 'Failed to remove plugin' },
      { status: 500 }
    )
  }
}