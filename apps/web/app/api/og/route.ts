import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'Noxion Blog'
    
    return new Response(
      `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="630" fill="#ffffff"/>
        <text x="600" y="315" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#111827">
          ${title}
        </text>
        <text x="600" y="370" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#6b7280">
          Noxion Blog
        </text>
      </svg>`,
      {
        headers: {
          'Content-Type': 'image/svg+xml',
        },
      }
    )
  } catch (e) {
    console.error('Error generating OG image:', e)
    return new Response('Failed to generate image', { status: 500 })
  }
}