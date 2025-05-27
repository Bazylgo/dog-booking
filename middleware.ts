import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define protected routes that require authentication
const protectedRoutes = ["/reservations", "/bookings", "/profile", "/admin"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Get the authentication cookie
  const authCookie = request.cookies.get("doghotel_auth")

  // If the route is protected and the user is not authenticated, redirect to login
  if (isProtectedRoute && !authCookie) {
    const url = new URL("/login", request.url)
    // Add the original URL as a query parameter to redirect after login
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all routes except static files, api routes, and _next
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
}
