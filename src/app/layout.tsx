import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import { validateRuntimeEnv } from '@/lib/security/env'
import './globals.css'

validateRuntimeEnv()

const notoSansJp = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: 'アイボウくん',
  description: 'Googleマップ集客の営業・マーケティング担当AIエージェント',
  manifest: "/manifest.json",
  applicationName: "アイボウくん",
  appleWebApp: {
    capable: true,
    title: "アイボウくん",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className={notoSansJp.variable}>
      <body>{children}</body>
    </html>
  )
}
