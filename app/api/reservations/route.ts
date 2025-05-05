import { NextResponse } from "next/server"
import prisma from "@/lib/db"

// GET all reservations for a user
export async function GET(request: Request) {
  try {
    // In a real app, you would get the userId from the authenticated session
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const reservations = await prisma.reservation.findMany({
      where: {
        userId: userId,
      },
      include: {
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
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(reservations)
  } catch (error) {
    console.error("Error fetching reservations:", error)
    return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 })
  }
}

// POST a new reservation
export async function POST(request: Request) {
  try {
    const data = await request.json()

    // In a real app, you would get the userId from the authenticated session
    const userId = data.userId

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Start a transaction to ensure all related data is created
    const reservation = await prisma.$transaction(async (prisma) => {
      // Create the reservation
      const newReservation = await prisma.reservation.create({
        data: {
          userId: userId,
          serviceId: data.serviceId,
          totalCost: data.totalCost,
          status: "PENDING",
        },
      })

      // Add pets to the reservation
      if (data.petIds && data.petIds.length > 0) {
        for (const petId of data.petIds) {
          await prisma.reservationPet.create({
            data: {
              reservationId: newReservation.id,
              petProfileId: petId,
            },
          })
        }
      }

      // Add service dates and times
      if (data.serviceDates && data.serviceDates.length > 0) {
        for (const dateInfo of data.serviceDates) {
          const serviceDate = await prisma.serviceDate.create({
            data: {
              reservationId: newReservation.id,
              date: new Date(dateInfo.date),
              isSpecialDay: dateInfo.isSpecialDay || false,
            },
          })

          // Add service times for this date
          if (dateInfo.times && dateInfo.times.length > 0) {
            for (const timeInfo of dateInfo.times) {
              await prisma.serviceTime.create({
                data: {
                  serviceDateId: serviceDate.id,
                  startTime: timeInfo.startTime,
                  duration: timeInfo.duration,
                  isOutsideNormalHours: timeInfo.isOutsideNormalHours || false,
                },
              })
            }
          }
        }
      }

      // Create initial payment record if payment info is provided
      if (data.payment) {
        await prisma.payment.create({
          data: {
            reservationId: newReservation.id,
            amount: data.payment.amount,
            status: data.payment.status || "PENDING",
            method: data.payment.method,
            transactionId: data.payment.transactionId,
          },
        })
      }

      return newReservation
    })

    return NextResponse.json(reservation, { status: 201 })
  } catch (error) {
    console.error("Error creating reservation:", error)
    return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 })
  }
}
