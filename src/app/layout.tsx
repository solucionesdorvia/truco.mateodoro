import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { MainLayout } from '@/components/layout/MainLayout'
import { Toaster } from 'sonner'

// Force all pages to be dynamic (server-rendered) to avoid build-time issues
export const dynamic = 'force-dynamic'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Truco Argentino | Competitivo Online',
  description: 'Jugá al Truco Argentino online con amigos. Partidas en tiempo real, stake por equipos y rankings competitivos.',
  keywords: ['truco', 'argentino', 'cartas', 'juego', 'multiplayer', 'online', 'competitivo', 'apuestas'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-slate-950 text-white`}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <MainLayout>
              {children}
            </MainLayout>
            <Toaster 
              richColors 
              position="top-center" 
              toastOptions={{
                style: {
                  background: 'rgb(30 41 59)',
                  border: '1px solid rgb(51 65 85)',
                  color: 'white',
                }
              }}
            />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
