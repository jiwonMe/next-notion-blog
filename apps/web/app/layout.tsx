import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider, ErrorBoundary } from '@/components/common'
import { Header } from '@/components/layout'
import { Footer } from '@/components/layout'
import { getMetadataBase } from '@/site.config'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata = getMetadataBase()

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
            <Toaster 
              position="top-right"
              richColors
              closeButton
              duration={4000}
            />
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}