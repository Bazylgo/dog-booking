import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get all reservations for the user with related data
    const reservations = await prisma.reservation.findMany({
      where: {
        userId: user.id,
      },
      include: {
        service: true,
        pets: {
          include: {
            petProfile: true,
          },
        },
        serviceDates: {
          include: {
            serviceTimes: true,
          },
          orderBy: {
            date: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      reservations,
    })
  } catch (error) {
    console.error("Error fetching reservations:", error)
    return NextResponse.json(
      { error: "Failed to fetch reservations", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
