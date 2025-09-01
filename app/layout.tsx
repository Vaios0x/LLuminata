import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins'
})

export const metadata: Metadata = {
  title: 'Lluminata - Plataforma de Aprendizaje Adaptativo',
  description: 'Plataforma de aprendizaje adaptativo con IA para poblaciones vulnerables en América Latina. Soporte para necesidades especiales, contenido cultural y funcionamiento offline.',
  keywords: 'educación, IA, aprendizaje adaptativo, inclusión, América Latina, PWA',
  authors: [{ name: 'LLuminata Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#2563eb',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased bg-gray-50">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
