//app/api/auth/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AuthService } from "@/lib/auth-service"

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Validate email format
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    // Verify credentials against database
    const user = await AuthService.verifyPassword(email.toLowerCase().trim(), password)

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Update last login timestamp (optional)
    await AuthService.updateLastLogin(user.id)

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
    console.error("Authentication error:", error)
    return NextResponse.json(
      { error: "Authentication failed. Please try again." },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    // Log out the user by removing the authentication cookie
    const cookieStore = await cookies()
    cookieStore.delete("doghotel_auth")

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    )
  }
}