import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/contexts/theme-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SQL Table Update Portal",
  description: "Update SQL tables with a user-friendly interface",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
