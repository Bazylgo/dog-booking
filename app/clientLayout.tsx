"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { Toaster } from "react-hot-toast"

function Navigation({ isMenuOpen, setIsMenuOpen }: { isMenuOpen: boolean; setIsMenuOpen: (open: boolean) => void }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("Guest User")
  const [language, setLanguage] = useState<"en" | "pl">("en")
  const pathname = usePathname()

  const closeMenu = () => setIsMenuOpen(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    closeMenu()
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-white bg-opacity-90 backdrop-blur-md shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-[#C76E00]" onClick={closeMenu}>
          🐾 DogHotel
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex space-x-6 items-center">
          <Link href="/services" className="hover:text-orange-600">
            Services
          </Link>
          <Link href="/reservations" className="hover:text-orange-600">
            Reservations
          </Link>
          <Link href="/about" className="hover:text-orange-600">
            About Us
          </Link>

          {/* Language switcher */}
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 text-xs font-medium rounded-l-lg ${
                language === "en" ? "bg-[#C76E00] text-white" : "bg-white text-gray-900 hover:bg-gray-100"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("pl")}
              className={`px-3 py-1 text-xs font-medium rounded-r-lg ${
                language === "pl" ? "bg-[#C76E00] text-white" : "bg-white text-gray-900 hover:bg-gray-100"
              }`}
            >
              PL
            </button>
          </div>

          {/* Auth links for desktop */}
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <Link href="/profile" className="hover:text-orange-600">
                {userName}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-[#C76E00] cursor-pointer text-white px-4 py-2 rounded hover:bg-[#A55A00]"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button onClick={handleLogin} className="bg-[#C76E00] text-white px-4 py-2 rounded hover:bg-[#A55A00]">
              Sign in
            </button>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
          {isMenuOpen ? <X size={24} className="text-[#C76E00]" /> : <Menu size={24} className="text-[#C76E00]" />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-md py-4 z-40 flex flex-col items-center space-y-4">
          <Link href="/services" className="text-lg text-[#C76E00] hover:text-[#A55A00]" onClick={closeMenu}>
            Services
          </Link>
          <Link href="/reservations" className="text-lg text-[#C76E00] hover:text-[#A55A00]" onClick={closeMenu}>
            Reservations
          </Link>
          <Link href="/about" className="text-lg text-[#C76E00] hover:text-[#A55A00]" onClick={closeMenu}>
            About Us
          </Link>

          {/* Language switcher for mobile */}
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                language === "en" ? "bg-[#C76E00] text-white" : "bg-white text-gray-900 hover:bg-gray-100"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("pl")}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                language === "pl" ? "bg-[#C76E00] text-white" : "bg-white text-gray-900 hover:bg-gray-100"
              }`}
            >
              PL
            </button>
          </div>

          {/* Auth links for mobile */}
          {isLoggedIn ? (
            <>
              <Link href="/profile" className="text-lg text-[#C76E00] hover:text-[#A55A00]" onClick={closeMenu}>
                Profile
              </Link>
              <button onClick={handleLogout} className="text-lg cursor-pointer text-[#C76E00] hover:text-[#A55A00]">
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                handleLogin()
                closeMenu()
              }}
              className="text-lg text-[#C76E00] hover:text-[#A55A00]"
            >
              Sign in
            </button>
          )}
        </div>
      )}
    </header>
  )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // State for toggling the mobile menu
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <Navigation isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* Padding below fixed header */}
      <main className="pt-24 px-4 md:px-6 lg:px-8">{children}</main>
      <Toaster position="top-center" />
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto text-center">
          <p>&copy; 2025 DogHotel. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
