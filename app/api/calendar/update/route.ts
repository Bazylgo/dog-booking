import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { google } from "googleapis"

// Export the function to be called directly from other server components
export async function updateCalendar(data: {
  reservationId: string
  action: string
  testMode?: boolean
  explicitDates?: {
    checkInDate: string
    checkOutDate: string
    checkInTime: string
    checkOutTime: string
  }
}) {
  try {
    const { reservationId, action, testMode = false, explicitDates } = data

    // Get the reservation with all related data
    const reservation = await prisma.reservation.findUnique({
      where: {
        id: reservationId,
      },
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
        },
        calendarEvents: true, // Include calendar events
      },
    })

    if (!reservation) {
      throw new Error(`Reservation with ID ${reservationId} not found`)
    }

//     // Check if we're in development mode and not in test mode
//     if (process.env.NODE_ENV === "development" && !testMode) {
//       // In development, just log the calendar update instead of actually updating
//       console.log(`Calendar would be updated in production:`)
//       console.log(`Action: ${action}`)
//       console.log(`Reservation: ${JSON.stringify(reservation, null, 2)}`)
//
//       return { success: true, message: "Calendar update logged (development mode)" }
//     }

    // Configure Google Calendar API
    const auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)

    auth.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    })

    const calendar = google.calendar({ version: "v3", auth })

    // Log that we're actually making the API call
    console.log(`Making REAL Google Calendar API call for reservation ${reservationId}`)
    console.log(`Using Calendar ID: ${process.env.GOOGLE_CALENDAR_ID}`)

    // Handle different actions
    if (action === "create") {
      // For create, we'll create new calendar events

      // Format pet information
      const petInfo = reservation.pets
        .map((pet) => `${pet.petProfile.name} (${pet.petProfile.type}, ${pet.petProfile.weight})`)
        .join(", ")

      // Format user information
      const userInfo = `
        Client: ${reservation.user.name} ${reservation.user.surname}
        Phone: ${reservation.user.phone || "N/A"}
        Email: ${reservation.user.email}
        Address: ${reservation.user.address || "N/A"}, ${reservation.user.postalCode || "N/A"} ${
          reservation.user.city || "N/A"
        }
      `

      // Process based on service type
      if (reservation.service.name === "Nocleg") {
        // For overnight stays, we create one event spanning the entire stay

        // Find check-in and check-out dates
        const sortedDates = [...reservation.serviceDates].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        )

        if (sortedDates.length < 2) {
          throw new Error("Nocleg reservation must have at least check-in and check-out dates")
        }

        const checkInDate = sortedDates[0]
        const checkOutDate = sortedDates[sortedDates.length - 1]

        // Get check-in and check-out times
        const checkInTime = checkInDate.serviceTimes[0]?.startTime || "12:00"
        const checkOutTime = checkOutDate.serviceTimes[0]?.startTime || "12:00"

        // Create start and end datetime strings in ISO format
        const startDateTime = createISODateTime(checkInDate.date, checkInTime)
        const endDateTime = createISODateTime(checkOutDate.date, checkOutTime)

        // Create event summary and description
        const eventSummary = `Dog Hotel: Nocleg for ${reservation.user.name} ${reservation.user.surname}`
        const eventDescription = `
          Service: Overnight Stay
          ${userInfo}
          Pets: ${petInfo}
          Check-in: ${formatLocalDate(checkInDate.date)} at ${checkInTime}
          Check-out: ${formatLocalDate(checkOutDate.date)} at ${checkOutTime}
          Total Cost: ${reservation.totalCost.toFixed(2)} zł
          Reservation ID: ${reservation.id}
        `

        // Create the event object
        const event = {
          summary: eventSummary,
          description: eventDescription,
          start: {
            dateTime: startDateTime,
            timeZone: "Europe/Warsaw",
          },
          end: {
            dateTime: endDateTime,
            timeZone: "Europe/Warsaw",
          },
          location: "Madalińskiego 67/11, 02-549 Warsaw",
        }

        console.log("Creating calendar event:", JSON.stringify(event, null, 2))

        // Create the event
        const response = await calendar.events.insert({
          calendarId: process.env.GOOGLE_CALENDAR_ID,
          requestBody: event,
        })

        console.log("Calendar event created:", response.data.htmlLink)

        // Store the event ID in our database
        await prisma.calendarEvent.create({
          data: {
            reservationId: reservation.id,
            eventId: response.data.id,
            eventLink: response.data.htmlLink,
          },
        })

        return {
          success: true,
          message: "Calendar event created successfully",
          eventLink: response.data.htmlLink,
        }
      } else {
        // For Spacer or Wyzyta Domowa, create separate events for each date and time slot
        const createdEvents = []

        for (const serviceDate of reservation.serviceDates) {
          for (const timeSlot of serviceDate.serviceTimes) {
            // Calculate duration in minutes
            const durationMinutes = timeSlot.duration || 30

            // Create start datetime
            const startDateTime = createISODateTime(serviceDate.date, timeSlot.startTime)

            // Create end datetime by adding duration
            const endDateTime = addMinutesToISODateTime(startDateTime, durationMinutes)

            // Create event summary and description
            const eventSummary = `Dog Hotel: ${reservation.service.name} for ${reservation.user.name} ${reservation.user.surname}`
            const eventDescription = `
              Service: ${reservation.service.name}
              ${userInfo}
              Pets: ${petInfo}
              Duration: ${durationMinutes} minutes
              Reservation ID: ${reservation.id}
              Total Cost: ${reservation.totalCost.toFixed(2)} zł
            `

            // Create the event object
            const event = {
              summary: eventSummary,
              description: eventDescription,
              start: {
                dateTime: startDateTime,
                timeZone: "Europe/Warsaw",
              },
              end: {
                dateTime: endDateTime,
                timeZone: "Europe/Warsaw",
              },
              location:
                reservation.service.name === "Wyzyta Domowa"
                  ? `${reservation.user.address || "N/A"}, ${reservation.user.postalCode || "N/A"} ${
                      reservation.user.city || "N/A"
                    }`
                  : "Madalińskiego 67/11, 02-549 Warsaw",
            }

            console.log("Creating calendar event:", JSON.stringify(event, null, 2))

            // Create the event
            const response = await calendar.events.insert({
              calendarId: process.env.GOOGLE_CALENDAR_ID,
              requestBody: event,
            })

            console.log("Calendar event created:", response.data.htmlLink)

            // Store the event ID in our database
            await prisma.calendarEvent.create({
              data: {
                reservationId: reservation.id,
                eventId: response.data.id,
                eventLink: response.data.htmlLink,
                serviceDateId: serviceDate.id,
                serviceTimeId: timeSlot.id,
              },
            })

            createdEvents.push(response.data.htmlLink)
          }
        }

        return {
          success: true,
          message: `${createdEvents.length} calendar events created successfully`,
          eventLinks: createdEvents,
        }
      }
    } else if (action === "update") {
      // For update, we'll update existing calendar events or create new ones if needed

      // First, check if we have any existing calendar events for this reservation
      if (reservation.calendarEvents.length === 0) {
        // No existing events, create new ones
        return await updateCalendar({
          reservationId,
          action: "create",
          testMode,
        })
      }

      // Format pet information
      const petInfo = reservation.pets
        .map((pet) => `${pet.petProfile.name} (${pet.petProfile.type}, ${pet.petProfile.weight})`)
        .join(", ")

      // Format user information
      const userInfo = `
        Client: ${reservation.user.name} ${reservation.user.surname}
        Phone: ${reservation.user.phone || "N/A"}
        Email: ${reservation.user.email}
        Address: ${reservation.user.address || "N/A"}, ${reservation.user.postalCode || "N/A"} ${
          reservation.user.city || "N/A"
        }
      `

      // Process based on service type
      if (reservation.service.name === "Nocleg") {
        // For overnight stays, we update the single event
        let startDateTime, endDateTime

        // Use explicit dates if provided (to avoid timezone issues)
        if (explicitDates) {
          console.log("Using explicit dates for calendar update:", explicitDates)
          startDateTime = `${explicitDates.checkInDate}T${explicitDates.checkInTime}:00`
          endDateTime = `${explicitDates.checkOutDate}T${explicitDates.checkOutTime}:00`
        } else {
          // Find check-in and check-out dates
          const sortedDates = [...reservation.serviceDates].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          )

          if (sortedDates.length < 2) {
            throw new Error("Nocleg reservation must have at least check-in and check-out dates")
          }

          const checkInDate = sortedDates[0]
          const checkOutDate = sortedDates[sortedDates.length - 1]

          // Get check-in and check-out times
          const checkInTime = checkInDate.serviceTimes[0]?.startTime || "12:00"
          const checkOutTime = checkOutDate.serviceTimes[0]?.startTime || "12:00"

          // Create datetime strings in ISO format
          startDateTime = createISODateTime(checkInDate.date, checkInTime)
          endDateTime = createISODateTime(checkOutDate.date, checkOutTime)
        }

        // Create event summary and description
        const eventSummary = `Dog Hotel: Nocleg for ${reservation.user.name} ${reservation.user.surname}`
        const eventDescription = `
          Service: Overnight Stay
          ${userInfo}
          Pets: ${petInfo}
          Check-in: ${startDateTime.split("T")[0]} at ${startDateTime.split("T")[1].substring(0, 5)}
          Check-out: ${endDateTime.split("T")[0]} at ${endDateTime.split("T")[1].substring(0, 5)}
          Total Cost: ${reservation.totalCost.toFixed(2)} zł
          Reservation ID: ${reservation.id}
        `

        // Create the event object
        const event = {
          summary: eventSummary,
          description: eventDescription,
          start: {
            dateTime: startDateTime,
            timeZone: "Europe/Warsaw",
          },
          end: {
            dateTime: endDateTime,
            timeZone: "Europe/Warsaw",
          },
          location: "Madalińskiego 67/11, 02-549 Warsaw",
        }

        // Get the first calendar event (for Nocleg, we should only have one)
        const calendarEvent = reservation.calendarEvents[0]

        console.log("Updating calendar event:", calendarEvent.eventId)
        console.log("Event details:", JSON.stringify(event, null, 2))

        try {
          // Update the event
          const response = await calendar.events.update({
            calendarId: process.env.GOOGLE_CALENDAR_ID,
            eventId: calendarEvent.eventId,
            requestBody: event,
          })

          console.log("Calendar event updated:", response.data.htmlLink)

          // Update the event link in our database
          await prisma.calendarEvent.update({
            where: {
              id: calendarEvent.id,
            },
            data: {
              eventLink: response.data.htmlLink,
              updatedAt: new Date(),
            },
          })

          return {
            success: true,
            message: "Calendar event updated successfully",
            eventLink: response.data.htmlLink,
          }
        } catch (error) {
          console.error("Error updating calendar event:", error)

          // If the event doesn't exist anymore, create a new one
          console.log("Creating new calendar event as update failed")

          // Delete the old calendar event record
          await prisma.calendarEvent.delete({
            where: {
              id: calendarEvent.id,
            },
          })

          // Create a new event
          const newResponse = await calendar.events.insert({
            calendarId: process.env.GOOGLE_CALENDAR_ID,
            requestBody: event,
          })

          console.log("New calendar event created:", newResponse.data.htmlLink)

          // Store the new event ID in our database
          await prisma.calendarEvent.create({
            data: {
              reservationId: reservation.id,
              eventId: newResponse.data.id,
              eventLink: newResponse.data.htmlLink,
            },
          })

          return {
            success: true,
            message: "Calendar event recreated successfully",
            eventLink: newResponse.data.htmlLink,
          }
        }
      } else {
        // For Spacer or Wyzyta Domowa, update events for each date and time slot
        const updatedEvents = []
        const newEvents = []

        // Create a map of existing events by service date and time
        const eventMap = new Map()
        for (const event of reservation.calendarEvents) {
          if (event.serviceDateId && event.serviceTimeId) {
            const key = `${event.serviceDateId}-${event.serviceTimeId}`
            eventMap.set(key, event)
          }
        }

        // Track which events we've processed
        const processedEvents = new Set()

        // Process each service date and time
        for (const serviceDate of reservation.serviceDates) {
          for (const timeSlot of serviceDate.serviceTimes) {
            // Calculate duration in minutes
            const durationMinutes = timeSlot.duration || 30

            // Create start datetime
            const startDateTime = createISODateTime(serviceDate.date, timeSlot.startTime)

            // Create end datetime by adding duration
            const endDateTime = addMinutesToISODateTime(startDateTime, durationMinutes)

            // Create event summary and description
            const eventSummary = `Dog Hotel: ${reservation.service.name} for ${reservation.user.name} ${reservation.user.surname}`
            const eventDescription = `
              Service: ${reservation.service.name}
              ${userInfo}
              Pets: ${petInfo}
              Duration: ${durationMinutes} minutes
              Reservation ID: ${reservation.id}
              Total Cost: ${reservation.totalCost.toFixed(2)} zł
            `

            // Create the event object
            const event = {
              summary: eventSummary,
              description: eventDescription,
              start: {
                dateTime: startDateTime,
                timeZone: "Europe/Warsaw",
              },
              end: {
                dateTime: endDateTime,
                timeZone: "Europe/Warsaw",
              },
              location:
                reservation.service.name === "Wyzyta Domowa"
                  ? `${reservation.user.address || "N/A"}, ${reservation.user.postalCode || "N/A"} ${
                      reservation.user.city || "N/A"
                    }`
                  : "Madalińskiego 67/11, 02-549 Warsaw",
            }

            // Check if we have an existing event for this date and time
            const key = `${serviceDate.id}-${timeSlot.id}`
            const existingEvent = eventMap.get(key)

            if (existingEvent) {
              // Mark this event as processed
              processedEvents.add(existingEvent.id)

              console.log("Updating calendar event:", existingEvent.eventId)
              console.log("Event details:", JSON.stringify(event, null, 2))

              try {
                // Update the event
                const response = await calendar.events.update({
                  calendarId: process.env.GOOGLE_CALENDAR_ID,
                  eventId: existingEvent.eventId,
                  requestBody: event,
                })

                console.log("Calendar event updated:", response.data.htmlLink)

                // Update the event link in our database
                await prisma.calendarEvent.update({
                  where: {
                    id: existingEvent.id,
                  },
                  data: {
                    eventLink: response.data.htmlLink,
                    updatedAt: new Date(),
                  },
                })

                updatedEvents.push(response.data.htmlLink)
              } catch (error) {
                console.error("Error updating calendar event:", error)

                // If the event doesn't exist anymore, create a new one
                console.log("Creating new calendar event as update failed")

                // Delete the old calendar event record
                await prisma.calendarEvent.delete({
                  where: {
                    id: existingEvent.id,
                  },
                })

                // Create a new event
                const newResponse = await calendar.events.insert({
                  calendarId: process.env.GOOGLE_CALENDAR_ID,
                  requestBody: event,
                })

                console.log("New calendar event created:", newResponse.data.htmlLink)

                // Store the new event ID in our database
                await prisma.calendarEvent.create({
                  data: {
                    reservationId: reservation.id,
                    eventId: newResponse.data.id,
                    eventLink: newResponse.data.htmlLink,
                    serviceDateId: serviceDate.id,
                    serviceTimeId: timeSlot.id,
                  },
                })

                newEvents.push(newResponse.data.htmlLink)
              }
            } else {
              // No existing event, create a new one
              console.log("Creating new calendar event for new date/time")
              console.log("Event details:", JSON.stringify(event, null, 2))

              // Create a new event
              const response = await calendar.events.insert({
                calendarId: process.env.GOOGLE_CALENDAR_ID,
                requestBody: event,
              })

              console.log("New calendar event created:", response.data.htmlLink)

              // Store the new event ID in our database
              await prisma.calendarEvent.create({
                data: {
                  reservationId: reservation.id,
                  eventId: response.data.id,
                  eventLink: response.data.htmlLink,
                  serviceDateId: serviceDate.id,
                  serviceTimeId: timeSlot.id,
                },
              })

              newEvents.push(response.data.htmlLink)
            }
          }
        }

        // Delete any events that weren't processed (they're no longer needed)
        for (const event of reservation.calendarEvents) {
          if (!processedEvents.has(event.id)) {
            console.log("Deleting unused calendar event:", event.eventId)

            try {
              // Delete the event from Google Calendar
              await calendar.events.delete({
                calendarId: process.env.GOOGLE_CALENDAR_ID,
                eventId: event.eventId,
              })

              // Delete the event from our database
              await prisma.calendarEvent.delete({
                where: {
                  id: event.id,
                },
              })
            } catch (error) {
              console.error("Error deleting calendar event:", error)
              // Continue with other deletions even if this one failed
            }
          }
        }

        return {
          success: true,
          message: `Calendar events updated: ${updatedEvents.length} updated, ${newEvents.length} created`,
          updatedEvents,
          newEvents,
        }
      }
    } else if (action === "delete") {
      // For delete, remove all calendar events for this reservation
      for (const event of reservation.calendarEvents) {
        console.log("Deleting calendar event:", event.eventId)

        try {
          // Delete the event from Google Calendar
          await calendar.events.delete({
            calendarId: process.env.GOOGLE_CALENDAR_ID,
            eventId: event.eventId,
          })
        } catch (error) {
          console.error("Error deleting calendar event:", error)
          // Continue with other deletions even if this one failed
        }
      }

      // Delete all calendar event records from our database
      await prisma.calendarEvent.deleteMany({
        where: {
          reservationId: reservation.id,
        },
      })

      return { success: true, message: `${reservation.calendarEvents.length} calendar events deleted successfully` }
    } else {
      throw new Error(`Unknown action: ${action}`)
    }
  } catch (error) {
    console.error("Error updating calendar:", error)
    throw error
  }
}

// Create an ISO datetime string from a date and time
function createISODateTime(date: Date, timeString: string): string {
  // Format: YYYY-MM-DDThh:mm:ss
  const dateStr = formatLocalDate(date)
  return `${dateStr}T${timeString}:00`
}

// Add minutes to an ISO datetime string
function addMinutesToISODateTime(isoString: string, minutes: number): string {
  const date = new Date(isoString)
  date.setMinutes(date.getMinutes() + minutes)
  return date.toISOString()
}

// Format a date as YYYY-MM-DD
function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

// API route handler for HTTP requests
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const result = await updateCalendar({
      ...data,
      testMode: data.testMode || false,
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in calendar update API route:", error)
    return NextResponse.json(
      { error: "Failed to update calendar", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
