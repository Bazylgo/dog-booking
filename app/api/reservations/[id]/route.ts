import { Pool } from "pg"
import { NextResponse } from "next/server"

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id || isNaN(Number.parseInt(id, 10))) {
      return NextResponse.json({ error: "Invalid reservation ID" }, { status: 400 })
    }

    const result = await pool.query(`SELECT * FROM reservations WHERE id = $1`, [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      reservation: result.rows[0],
    })
  } catch (error) {
    console.error("Error fetching reservation:", error)
    return NextResponse.json({ error: `Failed to fetch reservation: ${error.message}` }, { status: 500 })
  }
}
