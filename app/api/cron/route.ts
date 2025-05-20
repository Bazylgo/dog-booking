import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// Function to update reservation statuses
async function updateReservationStatuses() {
  const now = new Date()

  try {
    // Find all confirmed reservations
    const confirmedReservations = await prisma.reservation.findMany({
      where: {
        status: "CONFIRMED",
      },
      include: {
        serviceDates: {
          orderBy: {
            date: "desc",
          },
          include: {
            serviceTimes: true,
          },
        },
      },
    })

    const updatedReservations = []

    for (const reservation of confirmedReservations) {
      // For each reservation, check if it has ended
      if (reservation.serviceDates.length > 0) {
        const lastServiceDate = reservation.serviceDates[0] // This is the latest date due to orderBy desc

        // Get the date and time of the last service
        const lastDate = new Date(lastServiceDate.date)
        let lastTime = "23:59" // Default to end of day

        if (lastServiceDate.serviceTimes.length > 0) {
          // Get the latest time and add the duration
          const lastTimeSlot = lastServiceDate.serviceTimes[0]
          const [hours, minutes] = lastTimeSlot.startTime.split(":").map(Number)
          const endMinutes = minutes + (lastTimeSlot.duration || 30)
          const endHours = hours + Math.floor(endMinutes / 60)
          const remainingMinutes = endMinutes % 60

          lastTime = `${String(endHours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`
        }

        // Create the end datetime
        const endDateTime = new Date(
          lastDate.getFullYear(),
          lastDate.getMonth(),
          lastDate.getDate(),
          Number.parseInt(lastTime.split(":")[0]),
          Number.parseInt(lastTime.split(":")[1]),
        )

        // If the end datetime is in the past, mark as completed
        if (endDateTime < now) {
          await prisma.reservation.update({
            where: {
              id: reservation.id,
            },
            data: {
              status: "COMPLETED",
            },
          })

          updatedReservations.push(reservation.id)
        }
      }
    }

    return {
      success: true,
      updatedReservations,
      message: `Updated ${updatedReservations.length} reservations to COMPLETED status`,
    }
  } catch (error) {
    console.error("Error updating reservation statuses:", error)
    throw error
  }
}

// API route handler for cron jobs
// This endpoint is designed to be called by a cron job service
export async function GET(request: Request) {
  try {
    // Call the update-reservation-status endpoint
    const updateResponse = await fetch(new URL("/api/update-reservation-status", request.url), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!updateResponse.ok) {
      throw new Error(`Failed to update reservation statuses: ${updateResponse.statusText}`)
    }

    const result = await updateResponse.json()

    return NextResponse.json({
      success: true,
      message: `Cron job completed successfully. Updated ${result.updatedReservations.length} reservations.`,
      details: result,
    })
  } catch (error) {
    console.error("Error in cron job:", error)
    return NextResponse.json(
      { error: "Cron job failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

// Helper function to get headers
function headers() {
  return {
    get: (name: string) => {
      // In a real environment, this would access the actual request headers
      return null
    },
  }
}
