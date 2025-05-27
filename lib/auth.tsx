// lib/auth.tsx
"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { useRouter } from "next/navigation"

// Define user type (updated to match your Prisma model)
export type User = {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'
}

// Define auth context type
type AuthContextType = {
  user: User | null
  loading: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signup: (email: string, password: string, name: string, surname: string) => Promise<void>
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider props
type AuthProviderProps = {
  children: React.ReactNode
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check authentication status via API (uses httpOnly cookies)
        const response = await fetch('/api/auth/status', {
          method: 'GET',
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          if (data.authenticated && data.user) {
            setUser(data.user)
          }
        }
      } catch (error) {
        console.error("Authentication check failed:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Login with email and password
  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Login failed")
      }

      const data = await response.json()
      setUser(data.user)

      // Redirect to home page
      router.push("/")
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Sign up with email and password
  const signup = async (email: string, password: string, name: string, surname: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ email, password, name, surname }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Signup failed")
      }

      const data = await response.json()
      setUser(data.user)

      // Redirect to home page
      router.push("/")
    } catch (error) {
      console.error("Signup failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = async () => {
    setLoading(true)
    try {
      await fetch("/api/auth", {
        method: "DELETE",
        credentials: 'include', // Important for cookies
      })

      setUser(null)
      
      // Redirect to home page
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setLoading(false)
    }
  }

  // Check if user is admin (using role from database)
  const isAdmin = user?.role === 'ADMIN' || user?.email === process.env.EMAIL_USER_ADMIN

  // Create auth context value
  const value = {
    user,
    loading,
    isAdmin,
    login,
    logout,
    signup,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Protected route wrapper (HOC)
export function withAuth<T extends object>(Component: React.ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading && !user) {
        router.push('/login')
      }
    }, [user, loading, router])

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#C76E00]"></div>
        </div>
      )
    }

    if (!user) {
      return null
    }

    return <Component {...props} />
  }
}