"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import {
  Calendar,
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

// Mock data for demonstration
const MOCK_RESERVATIONS = [
  {
    id: "res_1",
    status: "CONFIRMED",
    createdAt: new Date("2025-05-01T10:30:00"),
    totalCost: 240,
    service: {
      id: "svc_1",
      name: "Spacer",
    },
    pets: [
      {
        petProfile: {
          id: "pet_1",
          name: "Max",
          type: "DOG",
          weight: "16-25 kg",
        },
      },
      {
        petProfile: {
          id: "pet_2",
          name: "Bella",
          type: "DOG",
          weight: "<5 kg",
        },
      },
    ],
    serviceDates: [
      {
        id: "date_1",
        date: new Date("2025-05-10"),
        isSpecialDay: false,
        serviceTimes: [
          {
            id: "time_1",
            startTime: "10:00",
            duration: 60,
            isOutsideNormalHours: false,
          },
          {
            id: "time_2",
            startTime: "16:00",
            duration: 60,
            isOutsideNormalHours: false,
          },
        ],
      },
      {
        id: "date_2",
        date: new Date("2025-05-11"),
        isSpecialDay: true,
        serviceTimes: [
          {
            id: "time_3",
            startTime: "10:00",
            duration: 60,
            isOutsideNormalHours: false,
          },
          {
            id: "time_4",
            startTime: "16:00",
            duration: 60,
            isOutsideNormalHours: false,
          },
        ],
      },
    ],
  },
  {
    id: "res_2",
    status: "PENDING",
    createdAt: new Date("2025-05-02T14:15:00"),
    totalCost: 350,
    service: {
      id: "svc_2",
      name: "Nocleg",
    },
    pets: [
      {
        petProfile: {
          id: "pet_1",
          name: "Max",
          type: "DOG",
          weight: "16-25 kg",
        },
      },
    ],
    serviceDates: [
      {
        id: "date_3",
        date: new Date("2025-05-15"),
        isSpecialDay: false,
        serviceTimes: [
          {
            id: "time_5",
            startTime: "14:00", // Check-in time
            duration: 0,
            isOutsideNormalHours: false,
          },
        ],
      },
      {
        id: "date_4",
        date: new Date("2025-05-18"),
        isSpecialDay: false,
        serviceTimes: [
          {
            id: "time_6",
            startTime: "12:00", // Check-out time
            duration: 0,
            isOutsideNormalHours: false,
          },
        ],
      },
    ],
  },
  {
    id: "res_3",
    status: "COMPLETED",
    createdAt: new Date("2025-04-15T09:00:00"),
    totalCost: 180,
    service: {
      id: "svc_3",
      name: "Wyzyta Domowa",
    },
    pets: [
      {
        petProfile: {
          id: "pet_3",
          name: "Luna",
          type: "CAT",
          weight: "<5 kg",
        },
      },
    ],
    serviceDates: [
      {
        id: "date_5",
        date: new Date("2025-04-20"),
        isSpecialDay: true,
        serviceTimes: [
          {
            id: "time_7",
            startTime: "11:00",
            duration: 60,
            isOutsideNormalHours: false,
          },
        ],
      },
      {
        id: "date_6",
        date: new Date("2025-04-21"),
        isSpecialDay: true,
        serviceTimes: [
          {
            id: "time_8",
            startTime: "11:00",
            duration: 60,
            isOutsideNormalHours: false,
          },
        ],
      },
    ],
  },
]

export default function BookingsPage() {
  const [reservations, setReservations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [selectedReservation, setSelectedReservation] = useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTimeSlot, setEditingTimeSlot] = useState<any | null>(null)
  const [newTime, setNewTime] = useState("")

  useEffect(() => {
    // Simulate API call to fetch reservations
    const fetchReservations = async () => {
      setIsLoading(true)
      try {
        // In a real app, you would fetch from your API
        // const response = await fetch('/api/reservations?userId=current');
        // const data = await response.json();

        // Using mock data for demonstration
        setTimeout(() => {
          setReservations(MOCK_RESERVATIONS)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching reservations:", error)
        setIsLoading(false)
      }
    }

    fetchReservations()
  }, [])

  const upcomingReservations = reservations.filter((res) => res.status === "CONFIRMED" || res.status === "PENDING")

  const pastReservations = reservations.filter((res) => res.status === "COMPLETED" || res.status === "CANCELLED")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-green-500">Confirmed</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-500">Pending</Badge>
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

  const handleEditTimeSlot = (dateId: string, timeSlot: any) => {
    setEditingTimeSlot({
      dateId,
      timeSlot,
    })
    setNewTime(timeSlot.startTime)
    setIsEditDialogOpen(true)
  }

  const handleSaveTimeChange = async () => {
    if (!editingTimeSlot || !selectedReservation) return

    // In a real app, you would call your API to update the time slot
    // await fetch(`/api/reservations/${selectedReservation.id}/times/${editingTimeSlot.timeSlot.id}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ startTime: newTime }),
    // });

    // Update the local state to reflect the change
    const updatedReservation = {
      ...selectedReservation,
      serviceDates: selectedReservation.serviceDates.map((date: any) => {
        if (date.id === editingTimeSlot.dateId) {
          return {
            ...date,
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

    setIsEditDialogOpen(false)
    setEditingTimeSlot(null)
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
                                <Calendar size={14} className="text-muted-foreground" />
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
                                <Calendar size={14} className="text-muted-foreground" />
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
                                <Calendar size={14} className="text-muted-foreground" />
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
                                <Calendar size={14} className="text-muted-foreground" />
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
                  {canEditReservation(selectedReservation) && !isNoclegService(selectedReservation) && (
                    <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
                      Click on a time to edit
                    </Badge>
                  )}
                </div>

                <ScrollArea className="h-[300px] pr-4">
                  {isNoclegService(selectedReservation) ? (
                    <div className="space-y-2">
                      <div className="p-3 bg-muted rounded-md">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar size={16} className="text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(selectedReservation.serviceDates[0].date), "EEEE, MMMM d, yyyy")}
                          </span>
                        </div>
                        <div className="ml-6 flex items-center gap-2">
                          <Clock size={14} className="text-muted-foreground" />
                          <span>Check-in: {selectedReservation.serviceDates[0].serviceTimes[0].startTime}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-muted rounded-md">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar size={16} className="text-muted-foreground" />
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
                            {
                              selectedReservation.serviceDates[selectedReservation.serviceDates.length - 1]
                                .serviceTimes[0].startTime
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedReservation.serviceDates.map((date: any) => (
                        <div key={date.id} className="p-3 bg-muted rounded-md">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar size={16} className="text-muted-foreground" />
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
                                    handleEditTimeSlot(date.id, time)
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
                        ? "For changes to your overnight stay, please contact us directly."
                        : "You can edit the time of your appointments by clicking on them."}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Time Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Appointment Time</DialogTitle>
            <DialogDescription>
              Change the time for your appointment on{" "}
              {editingTimeSlot &&
                selectedReservation &&
                format(
                  new Date(selectedReservation.serviceDates.find((d: any) => d.id === editingTimeSlot.dateId).date),
                  "EEEE, MMMM d, yyyy",
                )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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
            >
              <Check size={16} />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
