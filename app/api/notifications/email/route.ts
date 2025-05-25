import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import nodemailer from "nodemailer"

// Export the function to be called directly from other server components
export async function sendEmailNotification(data: { reservationId: string; type: string }) {
  try {
    const { reservationId, type } = data

    // Get the reservation with all related data
    const reservation = await prisma.reservation.findUnique({
      where: {
        id: reservationId,
      },
      include: {
        user: true,
        service: true,
        pets: {
          // Changed from reservationPets to pets
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
    })

    if (!reservation) {
      throw new Error(`Reservation with ID ${reservationId} not found`)
    }

    // Get user email
    const userEmail = reservation.user.email

    // Create email content based on notification type
    let subject = ""
    let text = ""
    let html = ""

    if (type === "create") {
      subject = `Dog Hotel: Your Reservation Confirmation #${reservation.id.substring(0, 8)}`

      // Create text version
      text = `
        Thank you for your reservation at Dog Hotel!

        Reservation Details:
        - Service: ${reservation.service.name}
        - Total Cost: ${reservation.totalCost} zł
        - Status: ${reservation.status}

        Pets:
        ${reservation.pets.map((pet) => `- ${pet.petProfile.name} (${pet.petProfile.type})`).join("\n")}

        Dates:
        ${reservation.serviceDates
          .map((date) => {
            const formattedDate = new Date(date.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })

            if (reservation.service.name === "Nocleg") {
              // For overnight stays, show check-in and check-out times
              const times = date.serviceTimes.map((time) => time.startTime).join(" - ")
              return `- ${formattedDate}: ${times}`
            } else {
              // For other services, show all time slots
              return `- ${formattedDate}: ${date.serviceTimes
                .map((time) => `${time.startTime} (${time.duration} min)`)
                .join(", ")}`
            }
          })
          .join("\n")}

        Thank you for choosing Dog Hotel!
      `

      // Create HTML version (more styled)
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4a5568;">Dog Hotel Reservation Confirmation</h1>
          <p>Thank you for your reservation at Dog Hotel!</p>

          <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #2d3748; margin-top: 0;">Reservation Details</h2>
            <p><strong>Service:</strong> ${reservation.service.name}</p>
            <p><strong>Total Cost:</strong> ${reservation.totalCost} zł</p>
            <p><strong>Status:</strong> ${reservation.status}</p>
          </div>

          <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #2d3748; margin-top: 0;">Pets</h2>
            <ul>
              ${reservation.pets
                .map((pet) => `<li><strong>${pet.petProfile.name}</strong> (${pet.petProfile.type})</li>`)
                .join("")}
            </ul>
          </div>

          <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #2d3748; margin-top: 0;">Dates</h2>
            <ul>
              ${reservation.serviceDates
                .map((date) => {
                  const formattedDate = new Date(date.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })

                  if (reservation.service.name === "Nocleg") {
                    // For overnight stays, show check-in and check-out times
                    const times = date.serviceTimes.map((time) => time.startTime).join(" - ")
                    return `<li><strong>${formattedDate}:</strong> ${times}</li>`
                  } else {
                    // For other services, show all time slots
                    return `<li><strong>${formattedDate}:</strong> ${date.serviceTimes
                      .map((time) => `${time.startTime} (${time.duration} min)`)
                      .join(", ")}</li>`
                  }
                })
                .join("")}
            </ul>
          </div>

          <p style="margin-top: 30px;">Thank you for choosing Dog Hotel!</p>
          <p style="color: #718096; font-size: 0.9em;">This is an automated message, please do not reply.</p>
        </div>
      `
    } else if (type === "update") {
      subject = `Dog Hotel: Your Reservation Update #${reservation.id.substring(0, 8)}`

      // Similar structure as create but with update messaging
      text = `
        Your reservation at Dog Hotel has been updated!

        Updated Reservation Details:
        - Service: ${reservation.service.name}
        - Total Cost: ${reservation.totalCost} zł
        - Status: ${reservation.status}

        Pets:
        ${reservation.pets.map((pet) => `- ${pet.petProfile.name} (${pet.petProfile.type})`).join("\n")}

        Updated Dates:
        ${reservation.serviceDates
          .map((date) => {
            const formattedDate = new Date(date.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })

            if (reservation.service.name === "Nocleg") {
              const times = date.serviceTimes.map((time) => time.startTime).join(" - ")
              return `- ${formattedDate}: ${times}`
            } else {
              return `- ${formattedDate}: ${date.serviceTimes
                .map((time) => `${time.startTime} (${time.duration} min)`)
                .join(", ")}`
            }
          })
          .join("\n")}

        Thank you for choosing Dog Hotel!
      `

      // HTML version with update messaging
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4a5568;">Dog Hotel Reservation Update</h1>
          <p>Your reservation at Dog Hotel has been updated!</p>

          <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #2d3748; margin-top: 0;">Updated Reservation Details</h2>
            <p><strong>Service:</strong> ${reservation.service.name}</p>
            <p><strong>Total Cost:</strong> ${reservation.totalCost} zł</p>
            <p><strong>Status:</strong> ${reservation.status}</p>
          </div>

          <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #2d3748; margin-top: 0;">Pets</h2>
            <ul>
              ${reservation.pets
                .map((pet) => `<li><strong>${pet.petProfile.name}</strong> (${pet.petProfile.type})</li>`)
                .join("")}
            </ul>
          </div>

          <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #2d3748; margin-top: 0;">Updated Dates</h2>
            <ul>
              ${reservation.serviceDates
                .map((date) => {
                  const formattedDate = new Date(date.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })

                  if (reservation.service.name === "Nocleg") {
                    const times = date.serviceTimes.map((time) => time.startTime).join(" - ")
                    return `<li><strong>${formattedDate}:</strong> ${times}</li>`
                  } else {
                    return `<li><strong>${formattedDate}:</strong> ${date.serviceTimes
                      .map((time) => `${time.startTime} (${time.duration} min)`)
                      .join(", ")}</li>`
                  }
                })
                .join("")}
            </ul>
          </div>

          <p style="margin-top: 30px;">Thank you for choosing Dog Hotel!</p>
          <p style="color: #718096; font-size: 0.9em;">This is an automated message, please do not reply.</p>
        </div>
      `
    } else if (type === "cancel") {
      subject = `Dog Hotel: Your Reservation Cancellation #${reservation.id.substring(0, 8)}`

      // Cancellation messaging
      text = `
        Your reservation at Dog Hotel has been cancelled.

        Cancelled Reservation Details:
        - Service: ${reservation.service.name}
        - Total Cost: ${reservation.totalCost} zł

        If you did not request this cancellation or have any questions, please contact us.

        Thank you for your interest in Dog Hotel.
      `

      // HTML version with cancellation messaging
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4a5568;">Dog Hotel Reservation Cancellation</h1>
          <p>Your reservation at Dog Hotel has been cancelled.</p>

          <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #2d3748; margin-top: 0;">Cancelled Reservation Details</h2>
            <p><strong>Service:</strong> ${reservation.service.name}</p>
            <p><strong>Total Cost:</strong> ${reservation.totalCost} zł</p>
          </div>

          <p>If you did not request this cancellation or have any questions, please contact us.</p>

          <p style="margin-top: 30px;">Thank you for your interest in Dog Hotel.</p>
          <p style="color: #718096; font-size: 0.9em;">This is an automated message, please do not reply.</p>
        </div>
      `
    }

    // Check if we're in development mode
    if (process.env.NODE_ENV === "development") {
      // In development, just log the email instead of sending it
      console.log("Email would be sent in production:")
      console.log(`To: ${userEmail}`)
      console.log(`Subject: ${subject}`)
      console.log(`Text: ${text}`)
      console.log(`HTML: ${html}`)

      return { success: true, message: "Email logged (development mode)" }
    }

    // Configure email transport
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.example.com",
      port: Number.parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // Send the email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Dog Hotel" <noreply@doghotel.com>',
      to: userEmail,
      subject,
      text,
      html,
    })

    return { success: true, message: "Email sent successfully" }
  } catch (error) {
    console.error("Error sending email notification:", error)
    throw error
  }
}

// API route handler for HTTP requests
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const result = await sendEmailNotification(data)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in email notification API route:", error)
    return NextResponse.json(
      { error: "Failed to send email notification", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
