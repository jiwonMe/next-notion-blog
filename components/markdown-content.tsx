'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface MarkdownContentProps {
  content: string
  className?: string
}


export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={cn('markdown-content', className)}>
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
                className: 'anchor-link'
              }
            }
          ]
        ]}
        components={{
          // Headings
          h1: ({ children, ...props }) => (
            <h1 className="text-3xl font-bold mt-12 mb-6 first:mt-0 scroll-mt-20" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-2xl font-bold mt-10 mb-5 scroll-mt-20" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-xl font-semibold mt-8 mb-4 scroll-mt-20" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="text-lg font-semibold mt-6 mb-3 scroll-mt-20" {...props}>
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 className="text-base font-semibold mt-5 mb-3 scroll-mt-20" {...props}>
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 className="text-sm font-semibold mt-4 mb-2 text-muted-foreground uppercase tracking-wide scroll-mt-20" {...props}>
              {children}
            </h6>
          ),

          // Paragraphs
          p: ({ children, ...props }) => (
            <p className="mb-6 leading-7 text-foreground last:mb-0" {...props}>
              {children}
            </p>
          ),

          // Links
          a: ({ children, href, ...props }) => (
            <a 
              href={href}
              className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
              {...props}
            >
              {children}
            </a>
          ),

          // Lists
          ul: ({ children, ...props }) => (
            <ul className="mb-6 space-y-2 pl-6" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="mb-6 space-y-2 pl-6 list-decimal" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="leading-7" {...props}>
              {children}
            </li>
          ),

          // Code
          code: ({ children, className, ...props }: any) => {
            const isBlock = className?.includes('language-')
            
            if (isBlock) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            }
            
            return (
              <code 
                className="px-2 py-1 text-sm bg-muted text-foreground rounded font-mono" 
                {...props}
              >
                {children}
              </code>
            )
          },

          // Pre (code blocks) - Enhanced with syntax highlighting
          pre: ({ children, ...props }: any) => {
            const child = children?.props
            const language = child?.className?.replace('language-', '') || 'text'
            const codeContent = String(child?.children || '')
            
            const [copied, setCopied] = useState(false)
            
            const copyToClipboard = async () => {
              try {
                await navigator.clipboard.writeText(codeContent)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              } catch (err) {
                console.error('Failed to copy code:', err)
              }
            }
            
            if (child?.className?.includes('language-')) {
              return (
                <div className="relative group mb-6">
                  {/* Header with language and copy button */}
                  <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border border-b-0 rounded-t-lg text-sm">
                    <span className="text-muted-foreground font-mono lowercase">
                      {language}
                    </span>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-2 py-1 text-muted-foreground hover:text-foreground transition-colors rounded opacity-0 group-hover:opacity-100"
                      title="Copy code"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span className="text-xs">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span className="text-xs">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Code content */}
                  <pre className="bg-muted border rounded-b-lg overflow-x-auto text-sm leading-6 m-0 p-4">
                    {children}
                  </pre>
                </div>
              )
            }
            
            // Fallback for code blocks without language
            return (
              <div className="relative group mb-6">
                <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border border-b-0 rounded-t-lg text-sm">
                  <span className="text-muted-foreground font-mono">
                    code
                  </span>
                </div>
                <pre className="bg-muted border rounded-b-lg overflow-x-auto text-sm p-4 m-0" {...props}>
                  {children}
                </pre>
              </div>
            )
          },

          // Blockquotes
          blockquote: ({ children, ...props }) => (
            <blockquote className="mb-6 pl-6 border-l-4 border-muted-foreground/20 italic text-muted-foreground" {...props}>
              {children}
            </blockquote>
          ),

          // Tables
          table: ({ children, ...props }) => (
            <div className="mb-6 overflow-x-auto rounded-lg border">
              <table className="w-full border-collapse" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-muted" {...props}>
              {children}
            </thead>
          ),
          th: ({ children, ...props }) => (
            <th className="px-4 py-3 text-left font-semibold border-b border-border" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="px-4 py-3 border-b border-border" {...props}>
              {children}
            </td>
          ),

          // Images
          img: ({ src, alt, ...props }) => (
            <img 
              src={src} 
              alt={alt} 
              className="mb-6 w-full h-auto rounded-lg"
              {...props} 
            />
          ),

          // Horizontal Rule
          hr: ({ ...props }) => (
            <hr className="my-8 border-0 h-px bg-border" {...props} />
          ),

          // Strong and emphasis
          strong: ({ children, ...props }) => (
            <strong className="font-bold" {...props}>
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em className="italic" {...props}>
              {children}
            </em>
          ),

          // Details/Summary (for collapsible content)
          details: ({ children, ...props }) => (
            <details className="mb-6 rounded-lg border border-border bg-card" {...props}>
              {children}
            </details>
          ),
          summary: ({ children, ...props }) => (
            <summary className="cursor-pointer select-none rounded-t-lg bg-muted px-4 py-3 font-medium hover:bg-muted/80" {...props}>
              {children}
            </summary>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}