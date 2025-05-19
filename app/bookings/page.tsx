"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format, addDays } from "date-fns"
import {
  CalendarIcon,
  Clock,
  Dog,
  Cat,
  MapPin,
  Moon,
  Sunrise,
  AlertCircle,
  ChevronRight,
  Loader2,
  Edit,
  X,
  Check,
  CalendarIcon as CalendarLucide,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TimePickerInput } from "@/components/time-picker-input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/app/reservations/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export default function BookingsPage() {
  const [reservations, setReservations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [selectedReservation, setSelectedReservation] = useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTimeSlot, setEditingTimeSlot] = useState<any | null>(null)
  const [newTime, setNewTime] = useState("")
  const [newDate, setNewDate] = useState<Date | undefined>(undefined)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isNoclegEditMode, setIsNoclegEditMode] = useState(false)
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined)
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined)
  const [checkInTime, setCheckInTime] = useState("")
  const [checkOutTime, setCheckOutTime] = useState("")

  useEffect(() => {
    // Fetch reservations from the API
    const fetchReservations = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Get user email from localStorage or session - in a real app, this would come from auth
        const userEmail = localStorage.getItem("userEmail") || "user@example.com"

        const response = await fetch(`/api/bookings?email=${encodeURIComponent(userEmail)}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch reservations: ${response.statusText}`)
        }

        const data = await response.json()
        setReservations(data.reservations)
      } catch (err) {
        console.error("Error fetching reservations:", err)
        setError(err instanceof Error ? err.message : "Failed to load reservations")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReservations()
  }, [])

  const upcomingReservations = reservations.filter(
    (res) => res.status === "CONFIRMED" || res.status === "PENDING" || res.status === "IN_PROGRESS",
  )

  const pastReservations = reservations.filter((res) => res.status === "COMPLETED" || res.status === "CANCELLED")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-green-500">Confirmed</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500">In Progress</Badge>
      case "COMPLETED":
        return <Badge className="bg-blue-500">Completed</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-500">Cancelled</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName) {
      case "Nocleg":
        return <Moon size={16} className="text-orange-600" />
      case "Spacer":
        return <Sunrise size={16} className="text-orange-600" />
      case "Wyzyta Domowa":
        return <MapPin size={16} className="text-orange-600" />
      default:
        return null
    }
  }

  const handleViewDetails = (reservation: any) => {
    setSelectedReservation(reservation)
  }

  const handleEditTimeSlot = (dateId: string, timeSlot: any, date: Date) => {
    setEditingTimeSlot({
      dateId,
      timeSlot,
    })
    setNewTime(timeSlot.startTime)
    setNewDate(new Date(date))
    setIsNoclegEditMode(false)
    setIsEditDialogOpen(true)
  }

  const handleEditNocleg = (reservation: any) => {
    if (reservation.serviceDates.length < 2) return

    const checkInDateObj = new Date(reservation.serviceDates[0].date)
    const checkOutDateObj = new Date(reservation.serviceDates[1].date)

    setCheckInDate(checkInDateObj)
    setCheckOutDate(checkOutDateObj)
    setCheckInTime(reservation.serviceDates[0].serviceTimes[0]?.startTime || "12:00")
    setCheckOutTime(reservation.serviceDates[1].serviceTimes[0]?.startTime || "12:00")

    setSelectedReservation(reservation)
    setIsNoclegEditMode(true)
    setIsEditDialogOpen(true)
  }

  const handleSaveTimeChange = async () => {
    if (!editingTimeSlot || !selectedReservation || !newDate) return

    setIsLoading(true)
    try {
      // Call API to update the time slot
      const response = await fetch(`/api/bookings/update-time`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeId: editingTimeSlot.timeSlot.id,
          dateId: editingTimeSlot.dateId,
          startTime: newTime,
          date: newDate.toISOString(),
          isOutsideNormalHours: isOutsideNormalHours(newTime),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update time slot")
      }

      // Update the local state to reflect the change
      const updatedReservation = {
        ...selectedReservation,
        serviceDates: selectedReservation.serviceDates.map((date: any) => {
          if (date.id === editingTimeSlot.dateId) {
            return {
              ...date,
              date: newDate,
              serviceTimes: date.serviceTimes.map((time: any) => {
                if (time.id === editingTimeSlot.timeSlot.id) {
                  return {
                    ...time,
                    startTime: newTime,
                    isOutsideNormalHours: isOutsideNormalHours(newTime),
                  }
                }
                return time
              }),
            }
          }
          return date
        }),
      }

      setSelectedReservation(updatedReservation)
      setReservations(reservations.map((res) => (res.id === selectedReservation.id ? updatedReservation : res)))

      // Send email notification
      await sendEmailNotification(selectedReservation.id, "update")

      setIsEditDialogOpen(false)
      setEditingTimeSlot(null)
    } catch (error) {
      console.error("Error updating time slot:", error)
      alert("Failed to update time slot")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNoclegChange = async () => {
    if (!selectedReservation || !checkInDate || !checkOutDate) return

    setIsLoading(true)
    try {
      // Call API to update the Nocleg reservation
      const response = await fetch(`/api/bookings/update-nocleg`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: selectedReservation.id,
          checkInDate: checkInDate.toISOString(),
          checkOutDate: checkOutDate.toISOString(),
          checkInTime,
          checkOutTime,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update reservation")
      }

      const result = await response.json()

      // Update the local state to reflect the change
      const updatedReservation = {
        ...selectedReservation,
        serviceDates: [
          {
            ...selectedReservation.serviceDates[0],
            date: checkInDate,
            serviceTimes: [
              {
                ...selectedReservation.serviceDates[0].serviceTimes[0],
                startTime: checkInTime,
              },
            ],
          },
          {
            ...selectedReservation.serviceDates[1],
            date: checkOutDate,
            serviceTimes: [
              {
                ...selectedReservation.serviceDates[1].serviceTimes[0],
                startTime: checkOutTime,
              },
            ],
          },
        ],
      }

      setSelectedReservation(updatedReservation)
      setReservations(reservations.map((res) => (res.id === selectedReservation.id ? updatedReservation : res)))

      // Send email notification
      await sendEmailNotification(selectedReservation.id, "update")

      setIsEditDialogOpen(false)
      setIsNoclegEditMode(false)
    } catch (error) {
      console.error("Error updating Nocleg reservation:", error)
      alert("Failed to update reservation")
    } finally {
      setIsLoading(false)
    }
  }

  // Update the sendEmailNotification function to not require an email parameter
  const sendEmailNotification = async (reservationId: string, type: "create" | "update") => {
    try {
      await fetch("/api/notifications/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId,
          type,
        }),
      })
    } catch (error) {
      console.error("Error sending email notification:", error)
      // Don't fail the whole operation if email fails
    }
  }

  // Check if a time is outside normal hours (before 8 AM or after 8 PM)
  const isOutsideNormalHours = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number)
    return hours < 8 || hours >= 20
  }

  const canEditReservation = (reservation: any) => {
    return reservation.status === "CONFIRMED" || reservation.status === "PENDING"
  }

  const isNoclegService = (reservation: any) => {
    return reservation?.service?.name === "Nocleg"
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      ) : (
        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingReservations.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <p className="text-muted-foreground">You don't have any upcoming reservations.</p>
                <Button className="mt-4 bg-orange-600 hover:bg-orange-700" asChild>
                  <a href="/reservations">Make a Reservation</a>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingReservations.map((reservation) => (
                  <Card key={reservation.id} className="overflow-hidden">
                    <CardHeader className="bg-orange-50 py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            {getServiceIcon(reservation.service.name)}
                            <CardTitle className="text-lg">{reservation.service.name}</CardTitle>
                            {getStatusBadge(reservation.status)}
                          </div>
                          <CardDescription>Booked on {format(new Date(reservation.createdAt), "PPP")}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-orange-600">{reservation.totalCost.toFixed(2)} zł</div>
                          <Button
                            variant="link"
                            className="p-0 h-auto text-orange-600"
                            onClick={() => handleViewDetails(reservation)}
                          >
                            View Details <ChevronRight size={16} className="ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-4">
                      <div className="flex flex-col md:flex-row md:justify-between gap-4">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Pets</h4>
                          <div className="flex flex-wrap gap-2">
                            {reservation.pets.map((pet: any) => (
                              <Badge key={pet.petProfile.id} variant="outline" className="flex items-center gap-1">
                                {pet.petProfile.type === "DOG" ? (
                                  <Dog size={12} className="text-orange-600" />
                                ) : (
                                  <Cat size={12} className="text-orange-600" />
                                )}
                                {pet.petProfile.name}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-2">Dates</h4>
                          <div className="flex flex-wrap gap-2">
                            {isNoclegService(reservation) ? (
                              <div className="flex items-center gap-1">
                                <CalendarLucide size={14} className="text-muted-foreground" />
                                <span>
                                  {format(new Date(reservation.serviceDates[0].date), "MMM d")} -{" "}
                                  {format(
                                    new Date(reservation.serviceDates[reservation.serviceDates.length - 1].date),
                                    "MMM d, yyyy",
                                  )}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <CalendarLucide size={14} className="text-muted-foreground" />
                                <span>
                                  {reservation.serviceDates.length} day(s), next:{" "}
                                  {format(new Date(reservation.serviceDates[0].date), "MMM d, yyyy")}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastReservations.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <p className="text-muted-foreground">You don't have any past reservations.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastReservations.map((reservation) => (
                  <Card key={reservation.id} className="overflow-hidden opacity-80">
                    <CardHeader className="bg-gray-50 py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            {getServiceIcon(reservation.service.name)}
                            <CardTitle className="text-lg">{reservation.service.name}</CardTitle>
                            {getStatusBadge(reservation.status)}
                          </div>
                          <CardDescription>Booked on {format(new Date(reservation.createdAt), "PPP")}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{reservation.totalCost.toFixed(2)} zł</div>
                          <Button variant="link" className="p-0 h-auto" onClick={() => handleViewDetails(reservation)}>
                            View Details <ChevronRight size={16} className="ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-4">
                      <div className="flex flex-col md:flex-row md:justify-between gap-4">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Pets</h4>
                          <div className="flex flex-wrap gap-2">
                            {reservation.pets.map((pet: any) => (
                              <Badge key={pet.petProfile.id} variant="outline" className="flex items-center gap-1">
                                {pet.petProfile.type === "DOG" ? <Dog size={12} /> : <Cat size={12} />}
                                {pet.petProfile.name}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-2">Dates</h4>
                          <div className="flex flex-wrap gap-2">
                            {isNoclegService(reservation) ? (
                              <div className="flex items-center gap-1">
                                <CalendarLucide size={14} className="text-muted-foreground" />
                                <span>
                                  {format(new Date(reservation.serviceDates[0].date), "MMM d")} -{" "}
                                  {format(
                                    new Date(reservation.serviceDates[reservation.serviceDates.length - 1].date),
                                    "MMM d, yyyy",
                                  )}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <CalendarLucide size={14} className="text-muted-foreground" />
                                <span>
                                  {reservation.serviceDates.length} day(s), last:{" "}
                                  {format(
                                    new Date(reservation.serviceDates[reservation.serviceDates.length - 1].date),
                                    "MMM d, yyyy",
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Reservation Details Dialog */}
      {selectedReservation && (
        <Dialog open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getServiceIcon(selectedReservation.service.name)}
                {selectedReservation.service.name} Reservation Details
                {getStatusBadge(selectedReservation.status)}
              </DialogTitle>
              <DialogDescription>Booked on {format(new Date(selectedReservation.createdAt), "PPP")}</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <h3 className="font-medium mb-2">Pets</h3>
                <div className="space-y-2">
                  {selectedReservation.pets.map((pet: any) => (
                    <div key={pet.petProfile.id} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      {pet.petProfile.type === "DOG" ? (
                        <Dog size={16} className="text-orange-600" />
                      ) : (
                        <Cat size={16} className="text-orange-600" />
                      )}
                      <span>
                        {pet.petProfile.name} ({pet.petProfile.weight})
                      </span>
                    </div>
                  ))}
                </div>

                <h3 className="font-medium mt-6 mb-2">Cost</h3>
                <div className="p-3 bg-orange-50 rounded-md">
                  <div className="flex justify-between font-medium">
                    <span>Total Cost:</span>
                    <span className="text-orange-600">{selectedReservation.totalCost.toFixed(2)} zł</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Schedule</h3>
                  {canEditReservation(selectedReservation) && (
                    <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
                      {isNoclegService(selectedReservation) ? "Click Edit to change dates" : "Click on a time to edit"}
                    </Badge>
                  )}
                </div>

                <ScrollArea className="h-[300px] pr-4">
                  {isNoclegService(selectedReservation) ? (
                    <div className="space-y-2">
                      <div className="p-3 bg-muted rounded-md">
                        <div className="flex items-center gap-2 mb-1">
                          <CalendarLucide size={16} className="text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(selectedReservation.serviceDates[0].date), "EEEE, MMMM d, yyyy")}
                          </span>
                        </div>
                        <div className="ml-6 flex items-center gap-2">
                          <Clock size={14} className="text-muted-foreground" />
                          <span>
                            Check-in: {selectedReservation.serviceDates[0].serviceTimes[0]?.startTime || "12:00"}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-muted rounded-md">
                        <div className="flex items-center gap-2 mb-1">
                          <CalendarLucide size={16} className="text-muted-foreground" />
                          <span className="font-medium">
                            {format(
                              new Date(
                                selectedReservation.serviceDates[selectedReservation.serviceDates.length - 1].date,
                              ),
                              "EEEE, MMMM d, yyyy",
                            )}
                          </span>
                        </div>
                        <div className="ml-6 flex items-center gap-2">
                          <Clock size={14} className="text-muted-foreground" />
                          <span>
                            Check-out:{" "}
                            {selectedReservation.serviceDates[selectedReservation.serviceDates.length - 1]
                              .serviceTimes[0]?.startTime || "12:00"}
                          </span>
                        </div>
                      </div>

                      {canEditReservation(selectedReservation) && (
                        <Button
                          className="w-full mt-2 bg-orange-600 hover:bg-orange-700"
                          onClick={() => handleEditNocleg(selectedReservation)}
                        >
                          <Edit size={16} className="mr-2" /> Edit Stay Dates
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedReservation.serviceDates.map((date: any) => (
                        <div key={date.id} className="p-3 bg-muted rounded-md">
                          <div className="flex items-center gap-2 mb-2">
                            <CalendarLucide size={16} className="text-muted-foreground" />
                            <span className="font-medium">{format(new Date(date.date), "EEEE, MMMM d, yyyy")}</span>
                            {date.isSpecialDay && (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                Weekend/Holiday
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-2 ml-6">
                            {date.serviceTimes.map((time: any) => (
                              <div
                                key={time.id}
                                className={`flex items-center justify-between p-2 rounded ${
                                  canEditReservation(selectedReservation) ? "hover:bg-orange-100 cursor-pointer" : ""
                                }`}
                                onClick={() => {
                                  if (canEditReservation(selectedReservation)) {
                                    handleEditTimeSlot(date.id, time, new Date(date.date))
                                  }
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <Clock size={14} className="text-muted-foreground" />
                                  <span>
                                    {time.startTime} ({time.duration} min)
                                  </span>
                                  {time.isOutsideNormalHours && (
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                      Outside Hours
                                    </Badge>
                                  )}
                                </div>
                                {canEditReservation(selectedReservation) && (
                                  <Edit size={14} className="text-muted-foreground" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {canEditReservation(selectedReservation) && (
                  <Alert className="mt-4 bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">Need to make changes?</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      {isNoclegService(selectedReservation)
                        ? "You can edit your check-in and check-out dates and times."
                        : "You can edit the date and time of your appointments by clicking on them."}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Time and Date Dialog */}
      <Dialog open={isEditDialogOpen && !isNoclegEditMode} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>Change the date and time for your appointment</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">New Date</Label>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !newDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newDate ? format(newDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    onDateSelect={(dates) => {
                      if (dates.length > 0) {
                        setNewDate(dates[0])
                        setIsDatePickerOpen(false)
                      }
                    }}
                    selectedDates={newDate ? [newDate] : []}
                    blockedDates={[]}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-time">New Time</Label>
              <TimePickerInput id="edit-time" value={newTime} onChange={setNewTime} />
              {isOutsideNormalHours(newTime) && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  This time is outside normal hours (8 AM - 8 PM) and may incur additional charges.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex space-x-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="flex items-center gap-1"
            >
              <X size={16} />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveTimeChange}
              className="bg-orange-600 hover:bg-orange-700 flex items-center gap-1"
              disabled={isLoading || !newDate}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-1" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Nocleg Dialog */}
      <Dialog
        open={isEditDialogOpen && isNoclegEditMode}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) setIsNoclegEditMode(false)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Stay Dates</DialogTitle>
            <DialogDescription>Change your check-in and check-out dates and times</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Check-in Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkInDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkInDate ? format(checkInDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    onDateSelect={(dates) => {
                      if (dates.length > 0) {
                        setCheckInDate(dates[0])
                        // If check-out date is before check-in date, update it
                        if (checkOutDate && dates[0] > checkOutDate) {
                          setCheckOutDate(addDays(dates[0], 1))
                        }
                      }
                    }}
                    selectedDates={checkInDate ? [checkInDate] : []}
                    blockedDates={[]}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Check-in Time</Label>
              <TimePickerInput value={checkInTime} onChange={setCheckInTime} />
            </div>

            <div className="space-y-2">
              <Label>Check-out Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkOutDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOutDate ? format(checkOutDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    onDateSelect={(dates) => {
                      if (dates.length > 0 && checkInDate) {
                        // Ensure check-out date is after check-in date
                        if (dates[0] > checkInDate) {
                          setCheckOutDate(dates[0])
                        } else {
                          alert("Check-out date must be after check-in date")
                        }
                      }
                    }}
                    selectedDates={checkOutDate ? [checkOutDate] : []}
                    blockedDates={checkInDate ? [checkInDate] : []}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Check-out Time</Label>
              <TimePickerInput value={checkOutTime} onChange={setCheckOutTime} />
            </div>
          </div>

          <DialogFooter className="flex space-x-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setIsNoclegEditMode(false)
              }}
              className="flex items-center gap-1"
            >
              <X size={16} />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveNoclegChange}
              className="bg-orange-600 hover:bg-orange-700 flex items-center gap-1"
              disabled={isLoading || !checkInDate || !checkOutDate}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-1" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
