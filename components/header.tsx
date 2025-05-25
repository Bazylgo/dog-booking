"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Settings, User, LogOut, LogIn, Calendar, BookOpen, Home, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock authentication - in a real app, replace with your auth system
const useAuth = () => {
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate checking local storage or a cookie for auth state
    const storedUser = localStorage.getItem("doghotel_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = (email: string, name = "User") => {
    const newUser = { email, name }
    localStorage.setItem("doghotel_user", JSON.stringify(newUser))
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem("doghotel_user")
    setUser(null)
  }

  return { user, loading, login, logout, isAdmin: user?.email === process.env.EMAIL_HOST }
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, loading, login, logout, isAdmin } = useAuth()
  const [language, setLanguage] = useState<"en" | "pl">("en")
  const [mounted, setMounted] = useState(false)

  // Set mounted state to true after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // For demo purposes - in a real app, remove this
  useEffect(() => {
    // This is just for demo purposes to make testing easier
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "a" && e.altKey) {
        if (user?.email === "felixgabrielvinte@gmail.com") {
          logout()
        } else {
          login("felixgabrielvinte@gmail.com", "Admin")
        }
      } else if (e.key === "u" && e.altKey) {
        if (user) {
          logout()
        } else {
          login("user@example.com", "Regular User")
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [user, login, logout])

  const closeMenu = () => setIsMenuOpen(false)

  // Only determine active state on the client after mounting
  const isActive = (path: string) => {
    if (!mounted) return "text-gray-700" // Default state for server render
    return pathname === path ? "text-[#C76E00] font-medium" : "text-gray-700 hover:text-[#C76E00] transition-colors"
  }

  const navItems = [
    { href: "/", label: "Home", icon: <Home className="h-4 w-4 mr-2" /> },
    { href: "/reservations", label: "Reservations", icon: <Calendar className="h-4 w-4 mr-2" /> },
    { href: "/bookings", label: "Bookings", icon: <BookOpen className="h-4 w-4 mr-2" /> },
    { href: "/prices", label: "Prices", icon: <DollarSign className="h-4 w-4 mr-2" /> },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" onClick={closeMenu}>
            <span className="text-2xl">🐾</span>
            <span className="font-bold text-xl text-[#C76E00] hidden sm:inline">DogHotel</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={`flex items-center ${isActive(item.href)}`}>
                {item.label}
              </Link>
            ))}
            {/* Render admin link separately with client-side conditional */}
            {mounted && isAdmin && (
              <Link href="/admin/settings" className={`flex items-center ${isActive("/admin/settings")}`}>
                Settings
              </Link>
            )}
          </nav>

          {/* Language and Auth (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="flex rounded-md border border-gray-200 overflow-hidden">
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 text-xs ${
                  language === "en" ? "bg-[#C76E00] text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("pl")}
                className={`px-3 py-1 text-xs ${
                  language === "pl" ? "bg-[#C76E00] text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                PL
              </button>
            </div>

            {/* Auth Buttons/Menu */}
            {!mounted || loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-[#C76E00]">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-[#C76E00]">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="bg-[#C76E00] hover:bg-[#a85b00]"
                onClick={() => login("user@example.com", "Guest User")}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign in
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4 md:hidden">
            {mounted && !loading && user && (
              <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full mr-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-[#C76E00]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </Button>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-3 space-y-4">
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center p-2 rounded-md ${
                    mounted && pathname === item.href
                      ? "bg-orange-50 text-[#C76E00] font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={closeMenu}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              {/* Render admin link separately with client-side conditional */}
              {mounted && isAdmin && (
                <Link
                  href="/admin/settings"
                  className={`flex items-center p-2 rounded-md ${
                    mounted && pathname === "/admin/settings"
                      ? "bg-orange-50 text-orange-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={closeMenu}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              )}
            </nav>

            {/* Language Switcher (Mobile) */}
            <div className="flex justify-center pt-2 border-t border-gray-100">
              <div className="flex rounded-md border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-4 py-2 ${
                    language === "en" ? "bg-[#C76E00] text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("pl")}
                  className={`px-4 py-2 ${
                    language === "pl" ? "bg-[#C76E00] text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  PL
                </button>
              </div>
            </div>

            {/* Auth Section (Mobile) */}
            <div className="pt-2 border-t border-gray-100">
              {!mounted || loading ? (
                <div className="w-full h-10 rounded bg-gray-200 animate-pulse"></div>
              ) : user ? (
                <div className="space-y-2">
                  <div className="flex items-center p-2 rounded-md bg-gray-50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-[#C76E00] mr-2">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-50"
                    onClick={closeMenu}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      closeMenu()
                    }}
                    className="flex items-center w-full p-2 rounded-md text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </button>
                </div>
              ) : (
                <Button
                  variant="default"
                  size="lg"
                  className="w-full bg-[#C76E00] hover:bg-[#a85b00]"
                  onClick={() => {
                    login("user@example.com", "Guest User")
                    closeMenu()
                  }}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign in
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
