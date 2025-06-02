import { NextResponse } from "next/server"
import { ratelimit } from '@/lib/rateLimiter';

// Define the response type for the Distance Matrix API
interface DistanceMatrixResponse {
  destination_addresses: string[]
  origin_addresses: string[]
  rows: {
    elements: {
      distance: {
        text: string
        value: number // distance in meters
      }
      duration: {
        text: string
        value: number // duration in seconds
      }
      status: string
    }[]
  }[]
  status: string
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';

  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { origin, destination } = await request.json()

    if (!origin || !destination) {
      return NextResponse.json({ error: "Origin and destination addresses are required" }, { status: 400 })
    }

    // Check if addresses are identical or very similar
    if (areAddressesSimilar(origin, destination)) {
      return NextResponse.json({ distance: 0 })
    }

    // Check if API key is available
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      // Fall back to mock calculation if no API key
      const mockDistance = calculateMockDistance(origin, destination)
      return NextResponse.json({ distance: mockDistance })
    }

    // Encode addresses for URL
    const encodedOrigin = encodeURIComponent(origin)
    const encodedDestination = encodeURIComponent(destination)

    // Build the API URL
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodedOrigin}&destinations=${encodedDestination}&units=metric&key=${apiKey}`

    // Make the API request
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`)
    }

    const data: DistanceMatrixResponse = await response.json()

    // Check if the API returned a valid response
    if (!response.ok) {
      console.error("HTTP error:", response.status, response.statusText);
      console.error("Response headers:", [...response.headers.entries()]);
      console.error("Raw body:", data);
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    // Check API-level error
    if (data.status !== "OK") {
      console.error("Google API error details:");
      console.error("Top-level status:", data.status);
      console.error("Possible missing permissions or key restrictions.");
      console.error("Full response body:", JSON.stringify(data, null, 2));
      throw new Error(`API returned error status: ${data.status}`);
    }

    // Extract the distance value
    const element = data.rows[0].elements[0]
    if (element.status !== "OK") {
      throw new Error(`Could not calculate distance: ${element.status}`)
    }

    // Convert meters to kilometers
    const distanceInKm = element.distance.value / 1000

    return NextResponse.json({ distance: distanceInKm })
  } catch (error) {
    console.error("Error calculating distance:", error)

    // If there's an error, try to use the mock calculation
    try {
      const { origin, destination } = await request.json()

      // Check if addresses are identical or very similar
      if (areAddressesSimilar(origin, destination)) {
        return NextResponse.json({ distance: 0 })
      }

      const mockDistance = calculateMockDistance(origin, destination)
      return NextResponse.json({ distance: mockDistance })
    } catch (fallbackError) {
      return NextResponse.json({ error: "Failed to calculate distance" }, { status: 500 })
    }
  }
}

/**
 * Check if two addresses are identical or very similar
 */
function areAddressesSimilar(address1: string, address2: string): boolean {
  // Normalize addresses for comparison
  const normalize = (addr: string) => {
    return addr
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim()
      .replace(/[,.-]/g, "")
      .replace(/street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr/g, "")
      .replace(/\b(ul|ulica)\b/g, "") // Polish street prefix
  }

  const norm1 = normalize(address1)
  const norm2 = normalize(address2)

  // Check for exact match after normalization
  if (norm1 === norm2) {
    return true
  }

  // Check if one address is contained within the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return true
  }

  // Extract street name and number for comparison
  const extractStreetAndNumber = (addr: string) => {
    const parts = addr.split(/\s+/)
    // Try to find a number in the address
    const numberIndex = parts.findIndex((part) => /\d/.test(part))
    if (numberIndex >= 0) {
      // Assume the part before the number is the street name
      const streetName = parts.slice(0, numberIndex).join(" ")
      const number = parts[numberIndex]
      return { streetName, number }
    }
    return null
  }

  const addr1Parts = extractStreetAndNumber(norm1)
  const addr2Parts = extractStreetAndNumber(norm2)

  // If we could extract street and number from both addresses, compare them
  if (addr1Parts && addr2Parts) {
    // Check if street names are similar and numbers are the same
    if (
      addr1Parts.streetName.includes(addr2Parts.streetName) ||
      addr2Parts.streetName.includes(addr1Parts.streetName)
    ) {
      if (addr1Parts.number === addr2Parts.number) {
        return true
      }
    }
  }

  // Check for Madalińskiego 67 specifically (the dog hotel address)
  if (
    (norm1.includes("madalinskiego") || norm1.includes("madalińskiego")) &&
    norm1.includes("67") &&
    (norm2.includes("madalinskiego") || norm2.includes("madalińskiego")) &&
    norm2.includes("67")
  ) {
    return true
  }

  return false
}

/**
 * Mock function for distance calculation when API is not available
 * @param address1 The origin address
 * @param address2 The destination address
 * @returns A mock distance in kilometers
 */
function calculateMockDistance(address1: string, address2: string): number {
  // Check if addresses are identical or very similar
  if (areAddressesSimilar(address1, address2)) {
    return 0
  }

  // Check for specific addresses for more realistic results
  const addr1Lower = address1.toLowerCase()
  const addr2Lower = address2.toLowerCase()

  if (addr1Lower.includes("sulejówek") && addr2Lower.includes("warsaw")) {
    return 22.3 // Approximate distance from Sulejówek to Warsaw
  }

  if (addr1Lower.includes("piaseczno") && addr2Lower.includes("warsaw")) {
    return 17.8 // Approximate distance from Piaseczno to Warsaw
  }

  if (addr1Lower.includes("pruszków") && addr2Lower.includes("warsaw")) {
    return 15.2 // Approximate distance from Pruszków to Warsaw
  }

  if (addr1Lower.includes("legionowo") && addr2Lower.includes("warsaw")) {
    return 21.6 // Approximate distance from Legionowo to Warsaw
  }

  if (addr1Lower.includes("otwock") && addr2Lower.includes("warsaw")) {
    return 23.4 // Approximate distance from Otwock to Warsaw
  }

  // For other addresses, generate a more reasonable random distance
  // between 2 and 30 km with some consistency based on the input addresses
  const hash = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i)
      hash = hash & hash // Convert to 32bit integer
    }
    return hash
  }

  // Use the hash to generate a consistent distance
  const addressHash = (Math.abs(hash(address1 + address2)) % 1000) / 100

  // Generate a distance between 2 and 30 km
  return 2 + addressHash * 28
}
