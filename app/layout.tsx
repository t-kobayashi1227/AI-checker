import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

export const metadata: Metadata = {
  title: 'AI レベルチェック',
  description: 'AIに関する知識・活用度を10問4択クイズでチェック。あなたのAIレベルを診断しましょう。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className={`${notoSansJP.className} min-h-full bg-slate-50 text-slate-800 antialiased`}>
        {children}
      </body>
    </html>
  )
}
