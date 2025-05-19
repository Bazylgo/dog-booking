import { Pool } from "pg"
import { google } from "googleapis"
import { NextResponse } from "next/server"

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})

export async function POST(request: Request) {
  const body = await request.json()

  const { userInfo, pets, service, dates, cost } = body

  try {
    // 1. Save to database
    const dbResult = await pool.query(
      `INSERT INTO "Reservations" (
        full_name,
        email,
        phone,
        address,
        city,
        postal_code,
        service_type,
        total_cost,
        reservation_data,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id`,
      [
        `${userInfo.name} ${userInfo.surname}`,
        userInfo.email,
        userInfo.phone,
        userInfo.address,
        userInfo.city,
        userInfo.postalCode,
        service,
        cost,
        JSON.stringify({ pets, dates }),
        new Date(),
      ],
    )

    const reservationId = dbResult.rows[0].id

    // 2. Add to Google Calendar
    const auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)

    auth.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    })

    const calendar = google.calendar({ version: "v3", auth })

    // Format event details based on service type
    let eventSummary = ""
    let eventDescription = ""
    let startDateTime
    let endDateTime

    if (service === "Nocleg") {
      // For overnight stays
      const { startDate, endDate, pickupTime, dropoffTime } = dates

      // Ensure we're working with proper date strings
      const formattedStartDate =
        typeof startDate === "string" ? startDate : new Date(startDate).toISOString().split("T")[0]
      const formattedEndDate = typeof endDate === "string" ? endDate : new Date(endDate).toISOString().split("T")[0]

      // Create proper datetime objects
      startDateTime = new Date(`${formattedStartDate}T${dropoffTime}:00`)
      endDateTime = new Date(`${formattedEndDate}T${pickupTime}:00`)

      eventSummary = `Dog Hotel: Nocleg for ${userInfo.name} ${userInfo.surname}`
      eventDescription = `
        Service: Overnight Stay
        Client: ${userInfo.name} ${userInfo.surname}
        Phone: ${userInfo.phone}
        Email: ${userInfo.email}
        Address: ${userInfo.address}, ${userInfo.postalCode} ${userInfo.city}
        Pets: ${pets.map((p) => `${p.name} (${p.type}, ${p.weight})`).join(", ")}
        Check-in: ${formattedStartDate} at ${dropoffTime}
        Check-out: ${formattedEndDate} at ${pickupTime}
        Total Cost: ${cost.toFixed(2)} zł
      `
    } else {
      // For Spacer or Wyzyta Domowa
      const { datesWithTimes } = dates

      // Create separate calendar events for each date and time slot
      for (const dateWithTimes of datesWithTimes) {
        for (const timeSlot of dateWithTimes.times) {
          // Calculate duration in minutes
          let durationMinutes = 30 // Default
          if (timeSlot.duration === "1 hour") durationMinutes = 60
          else if (timeSlot.duration === "1.5 hours") durationMinutes = 90
          else if (timeSlot.duration === "2 hours") durationMinutes = 120
          else if (timeSlot.duration === "2.5 hours") durationMinutes = 150
          else if (timeSlot.duration === "3 hours") durationMinutes = 180
          else if (timeSlot.duration === "3.5 hours") durationMinutes = 210
          else if (timeSlot.duration === "4 hours") durationMinutes = 240
          else if (timeSlot.duration.includes("hour")) {
            const hours = Number.parseFloat(timeSlot.duration)
            durationMinutes = hours * 60
          }

          // Ensure we have a proper date object
          const date = new Date(dateWithTimes.date)
          const [hours, minutes] = timeSlot.time.split(":").map(Number)

          // Create the start date time
          startDateTime = new Date(date)
          startDateTime.setHours(hours, minutes, 0, 0)

          // Create the end date time
          endDateTime = new Date(startDateTime)
          endDateTime.setMinutes(endDateTime.getMinutes() + durationMinutes)

          eventSummary = `Dog Hotel: ${service} for ${userInfo.name} ${userInfo.surname}`
          eventDescription = `
        Service: ${service}
        Client: ${userInfo.name} ${userInfo.surname}
        Phone: ${userInfo.phone}
        Email: ${userInfo.email}
        Address: ${userInfo.address}, ${userInfo.postalCode} ${userInfo.city}
        Pets: ${pets.map((p) => `${p.name} (${p.type}, ${p.weight})`).join(", ")}
        Duration: ${timeSlot.duration}
        Reservation ID: ${reservationId}
        Total Cost: ${cost.toFixed(2)} zł
      `

          // Check if the date is valid before creating the event
          if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
            console.error("Invalid date detected:", {
              originalDate: dateWithTimes.date,
              parsedDate: date,
              startDateTime,
              endDateTime,
              timeSlot,
            })
            continue // Skip this event if dates are invalid
          }

          const event = {
            summary: eventSummary,
            description: eventDescription,
            start: {
              dateTime: startDateTime.toISOString(),
              timeZone: "Europe/Warsaw",
            },
            end: {
              dateTime: endDateTime.toISOString(),
              timeZone: "Europe/Warsaw",
            },
            location:
              service === "Wyzyta Domowa"
                ? `${userInfo.address}, ${userInfo.postalCode} ${userInfo.city}`
                : "Madalińskiego 67/11, 02-549 Warsaw",
          }

          await calendar.events.insert({
            calendarId: process.env.GOOGLE_CALENDAR_ID,
            requestBody: event,
          })
        }
      }

      // Return success after creating all events
      return NextResponse.json({
        success: true,
        message: "Reservation saved successfully",
        reservationId,
      })
    }

    // For Nocleg service, create a single event
    if (service === "Nocleg") {
      // Check if the date is valid before creating the event
      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        console.error("Invalid date detected for Nocleg service:", {
          startDate,
          endDate,
          startDateTime,
          endDateTime,
          pickupTime,
          dropoffTime,
        })
        return NextResponse.json({ error: "Invalid date format for reservation" }, { status: 400 })
      }

      const event = {
        summary: eventSummary,
        description: eventDescription,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: "Europe/Warsaw",
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: "Europe/Warsaw",
        },
        location: "Madalińskiego 67/11, 02-549 Warsaw",
      }

      await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        requestBody: event,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Reservation saved successfully",
      reservationId,
    })
  } catch (error) {
    console.error("Reservation Error:", error)
    return NextResponse.json({ error: `Failed to save reservation: ${error.message}` }, { status: 500 })
  }
}
