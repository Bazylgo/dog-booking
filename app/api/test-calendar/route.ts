import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { updateCalendar } from "../calendar/update/route"

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url)
    const reservationId = url.searchParams.get("reservationId")
    const action = url.searchParams.get("action") || "create"

    // If no reservation ID is provided, get the most recent reservation
    let targetReservationId = reservationId
    if (!targetReservationId) {
      const latestReservation = await prisma.reservation.findFirst({
        orderBy: {
          createdAt: "desc",
        },
      })

      if (!latestReservation) {
        return NextResponse.json({ error: "No reservations found" }, { status: 404 })
      }

      targetReservationId = latestReservation.id
    }

    // Run the calendar update
    const result = await updateCalendar({
      reservationId: targetReservationId,
      action: action as "create" | "update" | "delete",
      testMode: true,
    })

    return NextResponse.json({
      success: true,
      message: `Calendar ${action} test completed successfully`,
      reservationId: targetReservationId,
      result,
    })
  } catch (error) {
    console.error("Test calendar error:", error)
    return NextResponse.json(
      { error: "Failed to test calendar", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
