import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: { default: 'XMotor — India\'s Smartest Used Car Marketplace', template: '%s | XMotor' },
  description: 'Get the best price for your used car through competitive dealer bidding. Transparent, fast, and trusted.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'XMotor',
  },
}

export const viewport: Viewport = {
  themeColor: '#ff8c1a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-body antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
