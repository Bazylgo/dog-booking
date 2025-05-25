"use client"

import { useEffect, useState } from "react"

export default function ClientStatusUpdater() {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateReservationStatuses = async () => {
    if (isUpdating) return

    setIsUpdating(true)
    setError(null)

    try {
      const response = await fetch("/api/update-reservation-status")

      if (!response.ok) {
        throw new Error(`Failed to update statuses: ${response.statusText}`)
      }

      const data = await response.json()
      setLastUpdate(new Date())

      // If any reservations were updated, refresh the page to show the changes
      if (data.updatedCount > 0) {
        window.location.reload()
      }
    } catch (err) {
      console.error("Error updating reservation statuses:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsUpdating(false)
    }
  }

  useEffect(() => {
    // Update statuses when component mounts
    updateReservationStatuses()

    // Set up interval to check every minute
    const interval = setInterval(updateReservationStatuses, 60000)

    // Clean up interval on unmount
    return () => clearInterval(interval)
  }, [])

  // This component doesn't render anything visible
  return null
}
