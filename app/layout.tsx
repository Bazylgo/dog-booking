import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Toaster } from "react-hot-toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dog Hotel",
  description: "Book a stay or service for your furry friend",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider>
          <Header />
          <main className="pt-16 min-h-[calc(100vh-64px)]">{children}</main>
          <Toaster position="top-center" />
          <footer className="bg-gray-900 text-white py-8">
            <div className="container mx-auto text-center">
              <p>&copy; 2025 DogHotel. All rights reserved.</p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
