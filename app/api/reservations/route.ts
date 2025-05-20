import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { updateCalendar } from "../../calendar/update/route"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Create or update the reservation
    const reservation = await prisma.reservation.upsert({
      where: {
        id: data.id || "",
      },
      update: {
        // Update fields
        status: data.status,
        totalCost: data.totalCost,
        notes: data.notes,
        // Don't update relationships here
      },
      create: {
        // Create new reservation with all fields
        status: data.status,
        totalCost: data.totalCost,
        notes: data.notes,
        // Create relationships
        user: {
          connectOrCreate: {
            where: { email: data.user.email },
            create: data.user,
          },
        },
        service: {
          connect: { id: data.service.id },
        },
        pets: {
          create: data.pets.map((pet: any) => ({
            petProfile: {
              connectOrCreate: {
                where: { id: pet.petProfile.id || "" },
                create: pet.petProfile,
              },
            },
          })),
        },
        serviceDates: {
          create: data.serviceDates.map((serviceDate: any) => ({
            date: new Date(serviceDate.date),
            isSpecialDay: serviceDate.isSpecialDay,
            serviceTimes: {
              create: serviceDate.serviceTimes.map((serviceTime: any) => ({
                startTime: serviceTime.startTime,
                duration: serviceTime.duration,
                isOutsideNormalHours: serviceTime.isOutsideNormalHours,
              })),
            },
          })),
        },
      },
      include: {
        user: true,
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
    })

    // Update calendar
    try {
      await updateCalendar({
        reservationId: reservation.id,
        action: "create",
        testMode: true,
      })
    } catch (calendarError) {
      console.error("Failed to create calendar event:", calendarError)
      // Don't fail the whole request if calendar creation fails
    }

    return NextResponse.json({
      success: true,
      reservation,
    })
  } catch (error) {
    console.error("Error saving reservation:", error)
    return NextResponse.json(
      { error: "Failed to save reservation", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
