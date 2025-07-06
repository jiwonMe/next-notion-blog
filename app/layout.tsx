import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider, ErrorBoundary } from '@/components/common'
import { Header } from '@/components/layout'
import { Footer } from '@/components/layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Noxion - Notion Blog',
  description: 'A beautiful blog powered by Notion and Next.js',
  authors: [{ name: 'Noxion' }],
  keywords: ['blog', 'notion', 'nextjs', 'react', 'typescript'],
  openGraph: {
    title: 'Noxion - Notion Blog',
    description: 'A beautiful blog powered by Notion and Next.js',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Noxion - Notion Blog',
    description: 'A beautiful blog powered by Notion and Next.js',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}