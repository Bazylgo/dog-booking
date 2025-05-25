import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sendEmailNotification } from "../../notifications/email/route"
import { updateCalendar } from "../../calendar/update/route"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Extract user information
    const userInfo = data.userInfo
    const pets = data.pets
    const service = data.service
    const dates = data.dates
    const cost = data.cost

    // Find or create user
    let user
    try {
      // First, try to find the user by email
      user = await prisma.user.findUnique({
        where: {
          email: userInfo.email,
        },
      })

      // If user doesn't exist and not registered, create a new one
      if (!user && !userInfo.registered) {
        user = await prisma.user.create({
          data: {
            email: userInfo.email,
            name: userInfo.name,
            surname: userInfo.surname,
            phone: userInfo.phone,
            address: userInfo.address,
            city: userInfo.city,
            postalCode: userInfo.postalCode,
          },
        })
      } else if (!user && userInfo.registered) {
        // If user claims to be registered but we can't find them
        return NextResponse.json({ error: "User account not found" }, { status: 404 })
      } else {
        // User exists, update their information if needed
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: userInfo.name || user.name,
            surname: userInfo.surname || user.surname,
            phone: userInfo.phone || user.phone,
            address: userInfo.address || user.address,
            city: userInfo.city || user.city,
            postalCode: userInfo.postalCode || user.postalCode,
          },
        })
      }
    } catch (userError) {
      console.error("Error handling user:", userError)
      return NextResponse.json(
        {
          error: "Failed to process user information",
          details: userError instanceof Error ? userError.message : String(userError),
        },
        { status: 500 },
      )
    }

    if (!user) {
      return NextResponse.json({ error: "Failed to create or find user" }, { status: 500 })
    }

    // Find or create service
    let serviceRecord = await prisma.service.findUnique({
      where: { name: service },
    })

    if (!serviceRecord) {
      // Default values based on service type
      let basePrice = 40
      let additionalAnimal = 20
      let timeSurcharge = 10
      let additionalTime = 20

      if (service === "Nocleg") {
        basePrice = 91
        additionalAnimal = 61
        timeSurcharge = 10
        additionalTime = 0
      } else if (service === "Wyzyta Domowa") {
        basePrice = 45
        additionalAnimal = 25
        timeSurcharge = 10
        additionalTime = 20
      }

      serviceRecord = await prisma.service.create({
        data: {
          name: service,
          description: `${service} service`,
          basePrice,
          additionalAnimal,
          timeSurcharge,
          additionalTime,
        },
      })
    }

    // Create the reservation
    const reservation = await prisma.$transaction(async (tx) => {
      // Create the main reservation
      const newReservation = await tx.reservation.create({
        data: {
          userId: user.id,
          serviceId: serviceRecord.id,
          totalCost: cost,
          status: "CONFIRMED",
        },
      })

      // Create pet profiles and link to reservation
      for (const pet of pets) {
        // Create or find pet profile
        let petProfile = await tx.petProfile.findFirst({
          where: {
            userId: user.id,
            name: pet.name,
            type: pet.type.toUpperCase() === "CAT" ? "CAT" : "DOG",
          },
        })

        if (!petProfile) {
          petProfile = await tx.petProfile.create({
            data: {
              userId: user.id,
              name: pet.name || "Unnamed Pet",
              type: pet.type.toUpperCase() === "CAT" ? "CAT" : "DOG",
              weight: pet.weight,
              sex: pet.sex,
              age: pet.age,
            },
          })
        }

        // Link pet to reservation
        await tx.reservationPet.create({
          data: {
            reservationId: newReservation.id,
            petProfileId: petProfile.id,
          },
        })
      }

      // Process dates based on service type
      if (service === "Nocleg") {
        const { startDate, endDate, pickupTime, dropoffTime } = dates

        if (startDate) {
          // Create check-in date
          const checkInDate = await tx.serviceDate.create({
            data: {
              reservationId: newReservation.id,
              date: new Date(startDate),
              isSpecialDay: isWeekendOrHoliday(new Date(startDate)),
            },
          })

          // Add check-in time
          await tx.serviceTime.create({
            data: {
              serviceDateId: checkInDate.id,
              startTime: dropoffTime,
              duration: 0,
              isOutsideNormalHours: isOutsideNormalHours(dropoffTime),
            },
          })
        }

        if (endDate) {
          // Create check-out date
          const checkOutDate = await tx.serviceDate.create({
            data: {
              reservationId: newReservation.id,
              date: new Date(endDate),
              isSpecialDay: isWeekendOrHoliday(new Date(endDate)),
            },
          })

          // Add check-out time
          await tx.serviceTime.create({
            data: {
              serviceDateId: checkOutDate.id,
              startTime: pickupTime,
              duration: 0,
              isOutsideNormalHours: isOutsideNormalHours(pickupTime),
            },
          })
        }
      } else {
        // For Spacer or Wyzyta Domowa
        const { datesWithTimes } = dates

        for (const dateWithTimes of datesWithTimes) {
          // Create service date
          const serviceDate = await tx.serviceDate.create({
            data: {
              reservationId: newReservation.id,
              date: new Date(dateWithTimes.date),
              isSpecialDay: dateWithTimes.isSpecialDay,
            },
          })

          // Add times
          for (const timeSlot of dateWithTimes.times) {
            // Parse duration from string like "30 minutes" or "1 hour"
            let durationMinutes = 30 // Default
            if (timeSlot.duration) {
              if (timeSlot.duration === "1 hour") durationMinutes = 60
              else if (timeSlot.duration === "1.5 hours") durationMinutes = 90
              else if (timeSlot.duration === "2 hours") durationMinutes = 120
              else if (timeSlot.duration === "2.5 hours") durationMinutes = 150
              else if (timeSlot.duration === "3 hours") durationMinutes = 180
              else if (timeSlot.duration === "3.5 hours") durationMinutes = 210
              else if (timeSlot.duration === "4 hours") durationMinutes = 240
            }

            await tx.serviceTime.create({
              data: {
                serviceDateId: serviceDate.id,
                startTime: timeSlot.time,
                duration: durationMinutes,
                isOutsideNormalHours: timeSlot.isOutsideNormalHours,
              },
            })
          }
        }
      }

      // Create a payment record
      await tx.payment.create({
        data: {
          reservationId: newReservation.id,
          amount: cost,
          status: "COMPLETED",
          method: "Card",
        },
      })

      return newReservation
    })

    // Create a legacy reservation record for compatibility
    const legacyReservation = await prisma.reservations.create({
      data: {
        full_name: `${user.name} ${user.surname}`,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        postal_code: user.postalCode || "",
        service_type: service,
        total_cost: cost,
        reservation_data: data,
        migrated: true, // Mark as already migrated
        created_at: new Date(), // Add the created_at field with the current date and time
      },
    })

    // Send email notification
    let emailSuccess = true
    try {
      // Directly call the email notification function instead of using fetch
      await sendEmailNotification({
        reservationId: reservation.id,
        type: "create",
      })
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError)
      emailSuccess = false
      // Don't fail the whole request if email fails
    }

    // Update calendar
    let calendarSuccess = true
    try {
      // Directly call the calendar update function instead of using fetch
      await updateCalendar({
        reservationId: reservation.id,
        action: "create",
      })
    } catch (calendarError) {
      console.error("Failed to update calendar:", calendarError)
      calendarSuccess = false
    }

    return NextResponse.json({
      success: true,
      reservation,
      legacyReservation,
      emailSuccess,
      calendarSuccess,
    })
  } catch (error) {
    console.error("Error saving reservation:", error)
    return NextResponse.json(
      { error: "Failed to save reservation", details: error instanceof Error ? error.message : String(error) },
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
