import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: plugins, error } = await supabase
      .from('plugins')
      .select('*')
      .order('name')

    if (error) {
      throw error
    }

    return NextResponse.json(plugins)
  } catch (error) {
    console.error('Failed to fetch plugins:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plugins' },
      { status: 500 }
    )
  }
}