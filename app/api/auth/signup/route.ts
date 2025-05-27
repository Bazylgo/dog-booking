//app/api/auth/signup/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AuthService } from "@/lib/auth-service"

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Password strength validation
const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return "Password must be at least 8 characters long"
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return "Password must contain at least one lowercase letter"
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return "Password must contain at least one uppercase letter"
  }
  if (!/(?=.*\d)/.test(password)) {
    return "Password must contain at least one number"
  }
  return null
}

export async function POST(request: Request) {
  try {
    const { email, password, name, surname } = await request.json()

    // Validate required fields
    if (!email || !password || !name || !surname) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Validate email format
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    // Validate password strength
    const passwordError = validatePassword(password)
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 })
    }

    // Validate name and surname length
    if (name.trim().length < 2 || surname.trim().length < 2) {
      return NextResponse.json({ error: "Name and surname must be at least 2 characters long" }, { status: 400 })
    }

    // Create user in database
    const user = await AuthService.createUser(
      email.toLowerCase().trim(),
      password,
      name.trim(),
      surname.trim()
    )

    // Set authentication cookie
    const cookieStore = await cookies()
    cookieStore.set({
      name: "doghotel_auth",
      value: JSON.stringify({
        userId: user.id,
        email: user.email,
        authenticated: true
      }),
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    // Return user data (without sensitive information)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.name} ${user.surname}`,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)

    // Handle specific database errors
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    )
  }
}