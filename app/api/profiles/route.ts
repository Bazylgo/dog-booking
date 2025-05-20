import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET all profiles for a user
export async function GET(request: Request) {
  try {
    // In a real app, you would get the userId from the authenticated session
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const profiles = await prisma.petProfile.findMany({
      where: {
        userId: userId,
        isActive: true,
      },
    })

    return NextResponse.json(profiles)
  } catch (error) {
    console.error("Error fetching profiles:", error)
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 })
  }
}

// POST a new profile
export async function POST(request: Request) {
  try {
    const data = await request.json()

    // In a real app, you would get the userId from the authenticated session
    const userId = data.userId

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const profile = await prisma.petProfile.create({
      data: {
        userId: userId,
        name: data.name,
        type: data.type.toUpperCase(),
        weight: data.weight,
        sex: data.sex,
        age: data.age,
      },
    })

    return NextResponse.json(profile, { status: 201 })
  } catch (error) {
    console.error("Error creating profile:", error)
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
  }
}
