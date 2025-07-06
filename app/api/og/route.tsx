import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract parameters
    const title = searchParams.get('title') || 'Noxion Blog'
    const description = searchParams.get('description') || 'Notion-powered blog with insights and tutorials'
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    const date = searchParams.get('date')
    const readingTime = searchParams.get('readingTime')
    const type = searchParams.get('type') || 'article' // article, homepage, tag

    // Custom fonts (you can add custom fonts here if needed)
    // const fontRegular = await fetch(
    //   new URL('../../../assets/fonts/Inter-Regular.ttf', import.meta.url),
    // ).then((res) => res.arrayBuffer())

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            backgroundImage: `
              radial-gradient(circle at 25% 25%, #f3f4f6 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, #e5e7eb 0%, transparent 50%),
              linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)
            `,
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                radial-gradient(circle at 20% 80%, rgba(120, 113, 255, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 113, 120, 0.1) 0%, transparent 50%)
              `,
            }}
          />
          
          {/* Main Content Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 60px',
              maxWidth: '1000px',
              width: '100%',
              height: '100%',
              position: 'relative',
            }}
          >
            
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                marginBottom: '60px',
              }}
            >
              {/* Logo/Site Name */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#1f2937',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                >
                  N
                </div>
                <span
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                  }}
                >
                  Noxion
                </span>
              </div>

              {/* Type Badge */}
              <div
                style={{
                  backgroundColor: type === 'homepage' ? '#3b82f6' : '#10b981',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {type === 'homepage' ? 'Blog' : type === 'tag' ? 'Tag' : 'Article'}
              </div>
            </div>

            {/* Main Content */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                flex: 1,
                justifyContent: 'center',
                width: '100%',
              }}
            >
              {/* Title */}
              <h1
                style={{
                  fontSize: title.length > 50 ? '48px' : '64px',
                  fontWeight: 'bold',
                  color: '#111827',
                  lineHeight: 1.1,
                  marginBottom: '24px',
                  textAlign: 'center',
                  maxWidth: '900px',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {title}
              </h1>

              {/* Description */}
              {description && (
                <p
                  style={{
                    fontSize: '20px',
                    color: '#6b7280',
                    lineHeight: 1.4,
                    marginBottom: '32px',
                    maxWidth: '800px',
                    textAlign: 'center',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {description}
                </p>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    justifyContent: 'center',
                    marginBottom: '32px',
                  }}
                >
                  {tags.slice(0, 4).map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        padding: '6px 12px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '500',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Metadata */}
              {(date || readingTime) && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    color: '#9ca3af',
                    fontSize: '16px',
                  }}
                >
                  {date && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                      </svg>
                      {new Date(date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  )}
                  {readingTime && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/>
                      </svg>
                      {readingTime} min read
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Decoration */}
            <div
              style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'center',
                marginTop: '40px',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '4px',
                  backgroundColor: '#3b82f6',
                  borderRadius: '2px',
                }}
              />
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        // fonts: [
        //   {
        //     name: 'Inter',
        //     data: fontRegular,
        //     style: 'normal',
        //     weight: 400,
        //   },
        // ],
      },
    )
  } catch (e) {
    console.error('Error generating OG image:', e)
    return new Response('Failed to generate image', { status: 500 })
  }
}