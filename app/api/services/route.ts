import { NextResponse } from "next/server"
import prisma from "@/lib/db"

// GET all services
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
      },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}

// POST a new service (admin only)
export async function POST(request: Request) {
  try {
    const data = await request.json()

    // In a real app, you would check for admin authorization here

    const service = await prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        additionalAnimal: data.additionalAnimal,
        timeSurcharge: data.timeSurcharge,
        additionalTime: data.additionalTime,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
}
