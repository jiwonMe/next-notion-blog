'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { cn } from '@/lib/utils'

interface MarkdownContentProps {
  content: string
  className?: string
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={cn('prose max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeHighlight,
          rehypeKatex,
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: 'wrap',
              properties: {
                className: ['anchor-link'],
              },
            },
          ],
        ]}
        components={{
          // Headings with enhanced styling
          h1: ({ children, ...props }) => (
            <h1 {...props}>{children}</h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 {...props}>{children}</h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 {...props}>{children}</h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 {...props}>{children}</h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 {...props}>{children}</h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 {...props}>{children}</h6>
          ),
          
          // Enhanced code blocks
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : ''
            
            if (!inline && match) {
              return (
                <div className="relative group">
                  <pre {...props}>
                    <code className={className}>
                      {children}
                    </code>
                  </pre>
                  {language && (
                    <div className="absolute right-3 top-3 rounded-md bg-background/90 backdrop-blur-sm px-2 py-1 text-xs font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      {language}
                    </div>
                  )}
                  <button 
                    className="absolute right-3 bottom-3 rounded-md bg-background/90 backdrop-blur-sm px-2 py-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground"
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(String(children))
                      }
                    }}
                  >
                    Copy
                  </button>
                </div>
              )
            }
            
            return <code {...props}>{children}</code>
          },
          
          // Enhanced tables
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto rounded-lg border shadow-card">
              <table {...props}>{children}</table>
            </div>
          ),
          
          // Enhanced images with zoom effect
          img: ({ src, alt, ...props }) => (
            <figure className="group cursor-zoom-in">
              <img src={src} alt={alt} {...props} />
              {alt && <figcaption>{alt}</figcaption>}
            </figure>
          ),
          
          // Custom callout handling
          div: ({ children, className, ...props }) => {
            if (className?.includes('notion-callout')) {
              return (
                <div className={cn('notion-callout', className)} {...props}>
                  {children}
                </div>
              )
            }
            return <div className={className} {...props}>{children}</div>
          },
          
          // Enhanced blockquotes
          blockquote: ({ children, ...props }) => (
            <blockquote {...props}>{children}</blockquote>
          ),
          
          // Task list support
          ul: ({ children, className, ...props }) => {
            if (className?.includes('contains-task-list')) {
              return <ul className="task-list" data-type="taskList" {...props}>{children}</ul>
            }
            return <ul {...props}>{children}</ul>
          },
          
          // Task list items
          li: ({ children, className, ...props }) => {
            if (className?.includes('task-list-item')) {
              return <li className="task-list-item" {...props}>{children}</li>
            }
            return <li {...props}>{children}</li>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}