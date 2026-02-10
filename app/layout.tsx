import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'PLENGI',
  description: 'Created with react',
  generator: 'Abdel Cartagena and Juan Gomez',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-dollar-50">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
