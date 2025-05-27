import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dog Hotel",
  description: "Premium dog boarding and services",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} pt-16`}>
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
