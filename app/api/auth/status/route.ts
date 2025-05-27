//app/api/auth/status/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AuthService } from "@/lib/auth-service"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get("doghotel_auth")

    if (!authCookie || !authCookie.value) {
      return NextResponse.json({ authenticated: false }, { status: 200 })
    }

    let authData
    try {
      authData = JSON.parse(authCookie.value)
    } catch (error) {
      // Invalid cookie format, clear it
      cookieStore.delete("doghotel_auth")
      return NextResponse.json({ authenticated: false }, { status: 200 })
    }

    if (!authData.authenticated || !authData.userId) {
      return NextResponse.json({ authenticated: false }, { status: 200 })
    }

    // Verify the user still exists in the database
    const user = await AuthService.getUserById(authData.userId)
    if (!user) {
      // User no longer exists, clear the cookie
      cookieStore.delete("doghotel_auth")
      return NextResponse.json({ authenticated: false }, { status: 200 })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.name} ${user.surname}`,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Auth status check error:", error)
    return NextResponse.json({ authenticated: false }, { status: 200 })
  }
}