import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const now = new Date()

    // Find all confirmed reservations
    const activeReservations = await prisma.reservation.findMany({
      where: {
        status: "CONFIRMED",
      },
      include: {
        serviceDates: {
          include: {
            serviceTimes: true,
          },
          orderBy: {
            date: "asc",
          },
        },
      },
    })

    const updatedReservations = []

    // Check each reservation to see if it has ended
    for (const reservation of activeReservations) {
      // Sort service dates by date (ascending)
      const sortedDates = [...reservation.serviceDates].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      )

      if (sortedDates.length === 0) continue

      // Get the last service date (end of reservation)
      const lastServiceDate = sortedDates[sortedDates.length - 1]

      // Get the time from the last service date, or default to end of day
      let endTime = "23:59"
      if (lastServiceDate.serviceTimes.length > 0) {
        // For Nocleg, use the checkout time
        endTime = lastServiceDate.serviceTimes[0].startTime
      }

      // Create a date object for the end of the reservation
      const [hours, minutes] = endTime.split(":").map(Number)
      const endDateTime = new Date(lastServiceDate.date)
      endDateTime.setHours(hours, minutes, 0, 0)

      // If the end date/time has passed, mark as completed
      if (endDateTime < now) {
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { status: "COMPLETED" },
        })

        updatedReservations.push({
          id: reservation.id,
          previousStatus: "CONFIRMED",
          newStatus: "COMPLETED",
          endDateTime: endDateTime.toISOString(),
        })
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount: updatedReservations.length,
      updatedReservations,
    })
  } catch (error) {
    console.error("Error updating reservation statuses:", error)
    return NextResponse.json({ error: "Failed to update reservation statuses" }, { status: 500 })
  }
}
