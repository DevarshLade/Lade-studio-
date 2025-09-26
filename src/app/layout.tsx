import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/toaster'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary'
import './globals.css'
import { ClerkProvider } from '@/components/auth/ClerkProvider'
import { AuthProvider } from '@/context/AuthContext'
import { ClientProviders } from '@/components/providers/ClientProviders'

export const metadata: Metadata = {
  title: 'Lade Studio - Artistry in Every Detail',
  description: 'An e-commerce website for an independent artist selling unique, handmade products like Paintings, Hand-Painted Pots, and Terracotta Jewelry.',
  keywords: 'art, handmade, paintings, pottery, terracotta, jewelry, custom designs, unique art',
  authors: [{ name: 'Lade Studio' }],
  creator: 'Lade Studio',
  publisher: 'Lade Studio',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://lade-studio.com',
    title: 'Lade Studio - Artistry in Every Detail',
    description: 'An e-commerce website for an independent artist selling unique, handmade products like Paintings, Hand-Painted Pots, and Terracotta Jewelry.',
    siteName: 'Lade Studio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lade Studio - Artistry in Every Detail',
    description: 'An e-commerce website for an independent artist selling unique, handmade products like Paintings, Hand-Painted Pots, and Terracotta Jewelry.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Check if we have the required environment variables for Clerk
  const hasClerkConfig = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
        {/* Preload critical resources */}
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Playfair+Display:wght@400;700&display=swap" as="style" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        {/* Fallback layout that works even if providers fail */}
        <ErrorBoundary>
          {hasClerkConfig ? (
            <ClerkProvider>
              <AuthProvider>
                <ClientProviders>
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-grow">{children}</main>
                    <Footer />
                  </div>
                  <Toaster />
                </ClientProviders>
              </AuthProvider>
            </ClerkProvider>
          ) : (
            // Minimal layout without Clerk for cases where it's not configured
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
              <Toaster />
            </div>
          )}
        </ErrorBoundary>
      </body>
    </html>
  )
}