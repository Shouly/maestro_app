import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { AuthCheck } from '@/components/auth/auth-check'
import { APP_CONFIG } from '@/lib/config'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: APP_CONFIG.APP_NAME,
  description: 'Tauri + Next.js Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="maestro-theme">
          <AuthCheck>
            {children}
          </AuthCheck>
        </ThemeProvider>
      </body>
    </html>
  )
} 