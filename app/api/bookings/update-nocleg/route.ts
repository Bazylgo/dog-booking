import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PATCH(request: Request) {
  try {
    const { reservationId, checkInDate, checkOutDate, checkInTime, checkOutTime } = await request.json()

    if (!reservationId || !checkInDate || !checkOutDate || !checkInTime || !checkOutTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the service dates for this reservation
    const serviceDates = await prisma.serviceDate.findMany({
      where: {
        reservationId,
      },
      include: {
        serviceTimes: true,
      },
      orderBy: {
        date: "asc",
      },
    })

    if (serviceDates.length < 2) {
      return NextResponse.json({ error: "Invalid reservation structure" }, { status: 400 })
    }

    // Update check-in date and time
    await prisma.serviceDate.update({
      where: {
        id: serviceDates[0].id,
      },
      data: {
        date: new Date(checkInDate),
        isSpecialDay: isWeekendOrHoliday(new Date(checkInDate)),
      },
    })

    if (serviceDates[0].serviceTimes.length > 0) {
      await prisma.serviceTime.update({
        where: {
          id: serviceDates[0].serviceTimes[0].id,
        },
        data: {
          startTime: checkInTime,
          isOutsideNormalHours: isOutsideNormalHours(checkInTime),
        },
      })
    }

    // Update check-out date and time
    await prisma.serviceDate.update({
      where: {
        id: serviceDates[1].id,
      },
      data: {
        date: new Date(checkOutDate),
        isSpecialDay: isWeekendOrHoliday(new Date(checkOutDate)),
      },
    })

    if (serviceDates[1].serviceTimes.length > 0) {
      await prisma.serviceTime.update({
        where: {
          id: serviceDates[1].serviceTimes[0].id,
        },
        data: {
          startTime: checkOutTime,
          isOutsideNormalHours: isOutsideNormalHours(checkOutTime),
        },
      })
    }

    return NextResponse.json({
      success: true,
      reservationId,
    })
  } catch (error) {
    console.error("Error updating Nocleg reservation:", error)
    return NextResponse.json(
      { error: "Failed to update reservation", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

// Helper function to check if a time is outside normal hours (before 8 AM or after 8 PM)
function isOutsideNormalHours(timeString: string): boolean {
  const [hours, minutes] = timeString.split(":").map(Number)
  return hours < 8 || hours >= 20
}

// Helper function to check if a date is a weekend or holiday
function isWeekendOrHoliday(date: Date): boolean {
  const day = date.getDay()
  // Check if it's a weekend (0 = Sunday, 6 = Saturday)
  return day === 0 || day === 6
  // Note: For a complete implementation, you would also check against holidays
}
