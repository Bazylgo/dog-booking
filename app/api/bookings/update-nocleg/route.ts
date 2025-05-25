import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { updateCalendar } from "../../calendar/update/route"

export async function PATCH(request: Request) {
  try {
    const { reservationId, checkInDate, checkOutDate, checkInTime, checkOutTime } = await request.json()

    if (!reservationId || !checkInDate || !checkOutDate || !checkInTime || !checkOutTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate that check-out is after check-in
    const checkInDateTime = new Date(`${checkInDate}T${checkInTime}:00`)
    const checkOutDateTime = new Date(`${checkOutDate}T${checkOutTime}:00`)

    if (checkOutDateTime <= checkInDateTime) {
      return NextResponse.json({ error: "Check-out date/time must be after check-in date/time" }, { status: 400 })
    }

    // Get the reservation with service dates
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        serviceDates: {
          include: {
            serviceTimes: true,
          },
          orderBy: {
            date: "asc",
          },
        },
        calendarEvents: true,
      },
    })

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    if (reservation.serviceDates.length < 2) {
      return NextResponse.json({ error: "Invalid reservation structure" }, { status: 400 })
    }

    // Update the check-in date (first service date)
    await prisma.serviceDate.update({
      where: { id: reservation.serviceDates[0].id },
      data: {
        date: new Date(checkInDate),
        serviceTimes: {
          update: {
            where: { id: reservation.serviceDates[0].serviceTimes[0]?.id },
            data: { startTime: checkInTime },
          },
        },
      },
    })

    // Update the check-out date (last service date)
    await prisma.serviceDate.update({
      where: { id: reservation.serviceDates[1].id },
      data: {
        date: new Date(checkOutDate),
        serviceTimes: {
          update: {
            where: { id: reservation.serviceDates[1].serviceTimes[0]?.id },
            data: { startTime: checkOutTime },
          },
        },
      },
    })

    // Update calendar event if it exists
    if (reservation.calendarEvents && reservation.calendarEvents.length > 0) {
      try {
        // Instead of using fetch, directly call the updateCalendar function
        await updateCalendar({
          reservationId,
          action: "update",
          testMode: true,
        })
      } catch (calendarError) {
        console.error("Failed to update calendar event:", calendarError)
        // Don't fail the whole request if calendar update fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Nocleg reservation updated successfully",
    })
  } catch (error) {
    console.error("Error updating Nocleg reservation:", error)
    return NextResponse.json({ error: "Failed to update reservation" }, { status: 500 })
  }
}

// Also support POST for backward compatibility
export { PATCH as POST }
