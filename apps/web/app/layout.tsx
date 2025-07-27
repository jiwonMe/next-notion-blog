import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider, ErrorBoundary } from '@/components/common'
import { PlatformHeader } from '@/components/layout/platform-header'
import { Footer } from '@/components/layout'
import { getMetadataBase } from '@/site.config'
import { Toaster } from 'sonner'

export const metadata = getMetadataBase()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="ko" suppressHydrationWarning>
        <body className="font-sans antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ErrorBoundary>
              <div className="min-h-screen flex flex-col">
                <PlatformHeader />
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
    </ClerkProvider>
  )
}