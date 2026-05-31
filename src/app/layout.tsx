import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'アイボウくん',
  description: 'Googleマップ集客の営業・マーケティング担当AIエージェント',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
