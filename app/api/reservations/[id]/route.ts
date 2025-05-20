import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { updateCalendar } from "../../calendar/update/route"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const reservation = await prisma.reservation.findUnique({
      where: { id },
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
          orderBy: {
            date: "asc",
          },
        },
      },
    })

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    return NextResponse.json(reservation)
  } catch (error) {
    console.error("Error fetching reservation:", error)
    return NextResponse.json({ error: "Failed to fetch reservation" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // First, update the calendar to delete the event
    try {
      await updateCalendar({
        reservationId: id,
        action: "delete",
        testMode: true,
      })
    } catch (calendarError) {
      console.error("Failed to delete calendar event:", calendarError)
      // Continue with deletion even if calendar update fails
    }

    // Delete related records first
    await prisma.$transaction([
      // Delete calendar events
      prisma.calendarEvent.deleteMany({
        where: { reservationId: id },
      }),
      // Delete service times
      prisma.serviceTime.deleteMany({
        where: {
          serviceDate: {
            reservationId: id,
          },
        },
      }),
      // Delete service dates
      prisma.serviceDate.deleteMany({
        where: { reservationId: id },
      }),
      // Delete pet connections
      prisma.reservationToPet.deleteMany({
        where: { reservationId: id },
      }),
      // Finally delete the reservation
      prisma.reservation.delete({
        where: { id },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: "Reservation deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting reservation:", error)
    return NextResponse.json({ error: "Failed to delete reservation" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const data = await request.json()

    // Update the reservation status
    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: {
        status: data.status,
        notes: data.notes,
      },
      include: {
        user: true,
        service: true,
      },
    })

    return NextResponse.json({
      success: true,
      reservation: updatedReservation,
    })
  } catch (error) {
    console.error("Error updating reservation:", error)
    return NextResponse.json({ error: "Failed to update reservation" }, { status: 500 })
  }
}
