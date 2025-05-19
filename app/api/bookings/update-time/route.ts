import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PATCH(request: Request) {
  try {
    const { timeId, dateId, startTime, date, isOutsideNormalHours } = await request.json()

    if (!timeId || !startTime || !date || !dateId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // First update the service date
    const updatedDate = await prisma.serviceDate.update({
      where: {
        id: dateId,
      },
      data: {
        date: new Date(date),
        isSpecialDay: isWeekendOrHoliday(new Date(date)),
      },
    })

    // Then update the service time
    const updatedTime = await prisma.serviceTime.update({
      where: {
        id: timeId,
      },
      data: {
        startTime,
        isOutsideNormalHours,
      },
    })

    // Get the reservation ID for the notification
    const serviceDate = await prisma.serviceDate.findUnique({
      where: { id: dateId },
      select: { reservationId: true },
    })

    return NextResponse.json({
      success: true,
      updatedDate,
      updatedTime,
      reservationId: serviceDate?.reservationId,
    })
  } catch (error) {
    console.error("Error updating service time:", error)
    return NextResponse.json(
      { error: "Failed to update service time", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

// Helper function to check if a date is a weekend or holiday
function isWeekendOrHoliday(date: Date): boolean {
  const day = date.getDay()
  // Check if it's a weekend (0 = Sunday, 6 = Saturday)
  return day === 0 || day === 6
  // Note: For a complete implementation, you would also check against holidays
}
