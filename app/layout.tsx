import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Personality Test Platform - MBTI Assessment',
  description: 'Discover your personality type with our comprehensive MBTI-inspired assessment',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
