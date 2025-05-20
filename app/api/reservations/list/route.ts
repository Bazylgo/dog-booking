import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
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
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(reservations)
  } catch (error) {
    console.error("Error fetching reservations:", error)
    return NextResponse.json({ message: "Failed to fetch reservations" }, { status: 500 })
  }
}
