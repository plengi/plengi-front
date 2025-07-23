import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PLENGI',
  description: 'Created with react',
  generator: 'Abdel Cartagena',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
