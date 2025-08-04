import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "LexPilot AI - 智基灵云法智擎",
  description: "专业的AI法律助手，提供智能法律咨询服务",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
    </html>
  )
}
