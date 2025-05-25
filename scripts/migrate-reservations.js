const prisma = require('../lib/prisma')

async function migrateReservations() {
  console.log("Starting migration of legacy reservations...")

  try {
    // Debug what models are available
    console.log("Available Prisma models:", Object.keys(prisma))

    // Get all unmigrated reservations - use the correct model name
    // Note: Prisma converts "Reservations" model to "reservations" in the client
    const legacyReservations = await prisma.reservations.findMany({
      where: {
        migrated: false,
      },
    })

    console.log(`Found ${legacyReservations.length} unmigrated reservations`)

    for (const legacyReservation of legacyReservations) {
      console.log(`Migrating reservation ID: ${legacyReservation.id}`)

      try {
        // Parse the reservation data JSON
        const reservationData = legacyReservation.reservation_data

        // Extract user information
        const userInfo = reservationData.userInfo || {}
        const nameParts = legacyReservation.full_name.split(" ")
        const firstName = nameParts[0] || ""
        const lastName = nameParts.slice(1).join(" ") || ""

        // Find or create user
        let user = await prisma.user.findUnique({
          where: { email: legacyReservation.email },
        })

        if (!user) {
          console.log(`Creating new user for email: ${legacyReservation.email}`)
          user = await prisma.user.create({
            data: {
              email: legacyReservation.email,
              name: userInfo.name || firstName,
              surname: userInfo.surname || lastName,
              phone: legacyReservation.phone,
              address: legacyReservation.address || "",
              city: legacyReservation.city || "",
              postalCode: legacyReservation.postal_code || "",
            },
          })
        }

        // Find or create service
        let service = await prisma.service.findUnique({
          where: { name: legacyReservation.service_type },
        })

        if (!service) {
          console.log(`Creating service: ${legacyReservation.service_type}`)
          // Default values based on service type
          let basePrice = 40
          let additionalAnimal = 20
          let timeSurcharge = 10
          let additionalTime = 20

          if (legacyReservation.service_type === "Nocleg") {
            basePrice = 91
            additionalAnimal = 61
            timeSurcharge = 10
            additionalTime = 0
          } else if (legacyReservation.service_type === "Wyzyta Domowa") {
            basePrice = 45
            additionalAnimal = 25
            timeSurcharge = 10
            additionalTime = 20
          }

          service = await prisma.service.create({
            data: {
              name: legacyReservation.service_type,
              description: `${legacyReservation.service_type} service`,
              basePrice,
              additionalAnimal,
              timeSurcharge,
              additionalTime,
            },
          })
        }

        // Create the reservation
        const reservation = await prisma.reservation.create({
          data: {
            userId: user.id,
            serviceId: service.id,
            totalCost: Number.parseFloat(legacyReservation.total_cost.toString()),
            status: "CONFIRMED",
            createdAt: legacyReservation.created_at,
            updatedAt: legacyReservation.updated_at,
            legacyId: legacyReservation.id,
          },
        })

        // Process pets
        if (reservationData.pets && Array.isArray(reservationData.pets)) {
          for (const petData of reservationData.pets) {
            // Create pet profile if it doesn't exist
            const petProfile = await prisma.petProfile.create({
              data: {
                userId: user.id,
                name: petData.name || "Unknown Pet",
                type: petData.type?.toUpperCase() === "CAT" ? "CAT" : "DOG",
                weight: petData.weight || "<5 kg",
                sex: petData.sex || "Male",
                age: petData.age || "1",
              },
            })

            // Link pet to reservation
            await prisma.reservationPet.create({
              data: {
                reservationId: reservation.id,
                petProfileId: petProfile.id,
              },
            })
          }
        }

        // Process dates and times
        if (legacyReservation.service_type === "Nocleg") {
          if (reservationData.dates) {
            const { startDate, endDate, pickupTime, dropoffTime } = reservationData.dates

            if (startDate) {
              const startDateObj = new Date(startDate)

              // Create service date for check-in
              const serviceDate = await prisma.serviceDate.create({
                data: {
                  reservationId: reservation.id,
                  date: startDateObj,
                  isSpecialDay: isWeekendOrHoliday(startDateObj),
                },
              })

              // Add check-in time
              await prisma.serviceTime.create({
                data: {
                  serviceDateId: serviceDate.id,
                  startTime: dropoffTime || "12:00",
                  duration: 0, // No duration for check-in/out
                  isOutsideNormalHours: isOutsideNormalHours(dropoffTime || "12:00"),
                },
              })
            }

            if (endDate) {
              const endDateObj = new Date(endDate)

              // Create service date for check-out
              const serviceDate = await prisma.serviceDate.create({
                data: {
                  reservationId: reservation.id,
                  date: endDateObj,
                  isSpecialDay: isWeekendOrHoliday(endDateObj),
                },
              })

              // Add check-out time
              await prisma.serviceTime.create({
                data: {
                  serviceDateId: serviceDate.id,
                  startTime: pickupTime || "12:00",
                  duration: 0, // No duration for check-in/out
                  isOutsideNormalHours: isOutsideNormalHours(pickupTime || "12:00"),
                },
              })
            }
          }
        } else {
          // For Spacer or Wyzyta Domowa
          if (reservationData.dates && reservationData.dates.datesWithTimes) {
            for (const dateWithTimes of reservationData.dates.datesWithTimes) {
              const dateObj = new Date(dateWithTimes.date)

              // Create service date
              const serviceDate = await prisma.serviceDate.create({
                data: {
                  reservationId: reservation.id,
                  date: dateObj,
                  isSpecialDay: dateWithTimes.isSpecialDay || isWeekendOrHoliday(dateObj),
                },
              })

              // Add times
              if (dateWithTimes.times && Array.isArray(dateWithTimes.times)) {
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
                    else if (timeSlot.duration.includes("hour")) {
                      const hours = Number.parseFloat(timeSlot.duration)
                      if (!isNaN(hours)) {
                        durationMinutes = hours * 60
                      }
                    }
                  }

                  await prisma.serviceTime.create({
                    data: {
                      serviceDateId: serviceDate.id,
                      startTime: timeSlot.time || "12:00",
                      duration: durationMinutes,
                      isOutsideNormalHours:
                        timeSlot.isOutsideNormalHours || isOutsideNormalHours(timeSlot.time || "12:00"),
                    },
                  })
                }
              }
            }
          }
        }

        // Create a payment record
        await prisma.payment.create({
          data: {
            reservationId: reservation.id,
            amount: Number.parseFloat(legacyReservation.total_cost.toString()),
            status: "COMPLETED",
            method: "Unknown",
            createdAt: legacyReservation.created_at,
          },
        })

        // Mark the legacy reservation as migrated
        await prisma.reservations.update({
          where: { id: legacyReservation.id },
          data: { migrated: true },
        })

        console.log(`Successfully migrated reservation ID: ${legacyReservation.id}`)
      } catch (error) {
        console.error(`Error migrating reservation ID: ${legacyReservation.id}`, error)
      }
    }

    console.log("Migration completed")
  } catch (error) {
    console.error("Error in migration process:", error)
  }
}

// Helper function to check if a time is outside normal hours (before 8 AM or after 8 PM)
function isOutsideNormalHours(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number)
  return hours < 8 || hours >= 20
}

// Helper function to check if a date is a weekend or holiday
function isWeekendOrHoliday(date) {
  const day = date.getDay()
  // Check if it's a weekend (0 = Sunday, 6 = Saturday)
  return day === 0 || day === 6
  // Note: For a complete implementation, you would also check against holidays
}

// Run the migration
migrateReservations()
  .catch((e) => {
    console.error("Migration failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })