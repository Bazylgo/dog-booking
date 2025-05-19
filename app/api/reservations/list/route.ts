import { Pool } from "pg"
import { NextResponse } from "next/server"

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10)

    let query = `
      SELECT id, full_name, email, phone, service_type, total_cost, created_at
      FROM reservations
      WHERE 1=1
    `

    const values: any[] = []
    let paramIndex = 1

    if (email) {
      query += ` AND email = $${paramIndex}`
      values.push(email)
      paramIndex++
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    values.push(limit, offset)

    const result = await pool.query(query, values)

    return NextResponse.json({
      success: true,
      reservations: result.rows,
      total: result.rowCount,
    })
  } catch (error) {
    console.error("Error fetching reservations:", error)
    return NextResponse.json({ error: `Failed to fetch reservations: ${error.message}` }, { status: 500 })
  }
}
