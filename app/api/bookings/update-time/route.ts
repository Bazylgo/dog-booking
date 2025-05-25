import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { updateCalendar } from "../../calendar/update/route"

export async function PATCH(request: Request) {
  try {
    const { reservationId, serviceDate, serviceTime } = await request.json()

    if (!reservationId || !serviceDate || !serviceTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the service date and time records
    const serviceDateRecord = await prisma.serviceDate.findFirst({
      where: {
        id: serviceDate.id,
        reservationId,
      },
      include: {
        serviceTimes: true,
      },
    })

    if (!serviceDateRecord) {
      return NextResponse.json({ error: "Service date not found" }, { status: 404 })
    }

    // Update the service date
    await prisma.serviceDate.update({
      where: {
        id: serviceDate.id,
      },
      data: {
        date: new Date(serviceDate.date),
        isSpecialDay: serviceDate.isSpecialDay,
      },
    })

    // Update the service time
    if (serviceDateRecord.serviceTimes.length > 0 && serviceTime.id) {
      await prisma.serviceTime.update({
        where: {
          id: serviceTime.id,
        },
        data: {
          startTime: serviceTime.startTime,
          duration: serviceTime.duration,
          isOutsideNormalHours: serviceTime.isOutsideNormalHours,
        },
      })
    }

    // Update calendar event
    try {
      await updateCalendar({
        reservationId,
        action: "update",
        testMode: true,
      })
    } catch (calendarError) {
      console.error("Failed to update calendar event:", calendarError)
      // Don't fail the whole request if calendar update fails
    }

    return NextResponse.json({
      success: true,
      message: "Service date and time updated successfully",
    })
  } catch (error) {
    console.error("Error updating service date and time:", error)
    return NextResponse.json(
      {
        error: "Failed to update service date and time",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// Also support POST for backward compatibility
export { PATCH as POST }
