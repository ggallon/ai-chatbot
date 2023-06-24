import { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'

import '@/app/globals.css'

import { Header } from '@/components/header'
import { Providers } from '@/components/providers'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { fontMono, fontSans } from '@/lib/fonts'
import { findOriginURL } from '@/lib/utils/find-origin-url'
import { themeEffect } from '@/lib/utils/theme-effect'

export const metadata: Metadata = {
  metadataBase: findOriginURL(),
  title: {
    default: 'Proactice AI Chatbot',
    template: `%s - Proactice AI Chatbot`
  },
  description: 'An AI-powered chatbot built with Next.js and Vercel.',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  }
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(${themeEffect.toString()})();`
          }}
        />
      </head>
      <body
        className={`font-sans antialiased ${fontSans.variable} ${fontMono.variable}`}
      >
        <Toaster />
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex flex-1 flex-col bg-muted/50">{children}</main>
          </div>
          <TailwindIndicator />
        </Providers>
      </body>
    </html>
  )
}
