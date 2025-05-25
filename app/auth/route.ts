import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// Mock authentication API route
// In a real app, you would implement proper authentication with a backend

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // This is a mock authentication - in a real app, you would validate credentials
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Mock successful authentication
    // In a real app, you would verify credentials against a database
    const user = {
      id: "user_" + Math.random().toString(36).substring(2, 9),
      email,
      name: email.split("@")[0],
    }

    // Set a cookie to indicate the user is authenticated
    cookies().set({
      name: "doghotel_auth",
      value: "authenticated",
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.json(
      { error: "Authentication failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function DELETE() {
  // Log out the user by removing the authentication cookie
  cookies().delete("doghotel_auth")

  return NextResponse.json({
    success: true,
    message: "Logged out successfully",
  })
}
