import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { reservationId, type, email } = await request.json()

    if (!reservationId || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get reservation details
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        service: true,
        user: true,
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

    // Use the user's email from the reservation data
    const userEmail = reservation.user.email

    if (!userEmail) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 })
    }

    // In a real application, you would send an actual email here
    // For this example, we'll just log the email details
    console.log(`Sending email notification to: ${userEmail}`)
    console.log(`Notification type: ${type}`)
    console.log(`Reservation ID: ${reservationId}`)
    console.log(`Service: ${reservation.service.name}`)
    console.log(`User: ${reservation.user.name} ${reservation.user.surname}`)
    console.log(`Total cost: ${reservation.totalCost}`)

    // For a real implementation, you would use a service like SendGrid, Mailgun, etc.
    // Example with SendGrid:
    // const msg = {
    //   to: userEmail,
    //   from: 'your-email@example.com',
    //   subject: `Reservation ${type === 'create' ? 'Confirmation' : 'Update'}`,
    //   text: `Your reservation has been ${type === 'create' ? 'confirmed' : 'updated'}.`,
    //   html: `<p>Your reservation has been ${type === 'create' ? 'confirmed' : 'updated'}.</p>`,
    // };
    // await sgMail.send(msg);

    return NextResponse.json({
      success: true,
      message: `Email notification sent to ${userEmail}`,
    })
  } catch (error) {
    console.error("Error sending email notification:", error)
    return NextResponse.json(
      { error: "Failed to send email notification", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
