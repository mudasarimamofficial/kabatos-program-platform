import { Poppins } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import './globals.css'

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'COMPREX — Your program, made simple',
  description: 'A calm, clear way to stay consistent with your COMPREX wellness program.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
  userScalable: true,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={poppins.className}><body>{children}</body></html>
}
