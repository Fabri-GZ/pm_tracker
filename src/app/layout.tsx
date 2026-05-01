import type { Metadata } from 'next'
import { Unbounded, Poppins } from 'next/font/google'
import './globals.css'

const unbounded = Unbounded({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-unbounded',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PM Tracker — Avalon World Agency',
  description: 'Delivery tracking CRM for project managers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${unbounded.variable} ${poppins.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
