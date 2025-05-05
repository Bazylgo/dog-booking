"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { Loader2, Save, Plus, Trash2, Calendar, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Mock data for demonstration
const MOCK_SERVICES = [
  {
    id: "svc_1",
    name: "Nocleg",
    description: "Overnight stay at our dog hotel",
    basePrice: 100,
    additionalAnimal: 50,
    timeSurcharge: 30,
    additionalTime: 0,
    isActive: true,
  },
  {
    id: "svc_2",
    name: "Spacer",
    description: "We'll pick up your pet for a walk",
    basePrice: 40,
    additionalAnimal: 20,
    timeSurcharge: 20,
    additionalTime: 30,
    isActive: true,
  },
  {
    id: "svc_3",
    name: "Wyzyta Domowa",
    description: "We'll visit your home to take care of your pet",
    basePrice: 60,
    additionalAnimal: 30,
    timeSurcharge: 40,
    additionalTime: 45,
    isActive: true,
  },
]

const MOCK_HOLIDAYS = [
  {
    id: "hol_1",
    date: new Date("2025-01-01"),
    name: "New Year's Day",
  },
  {
    id: "hol_2",
    date: new Date("2025-01-06"),
    name: "Epiphany",
  },
  {
    id: "hol_3",
    date: new Date("2025-04-20"),
    name: "Easter Sunday",
  },
  {
    id: "hol_4",
    date: new Date("2025-04-21"),
    name: "Easter Monday",
  },
]

export default function AdminSettingsPage() {
  const [services, setServices] = useState<any[]>([])
  const [holidays, setHolidays] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("services")
  const [isSaving, setIsSaving] = useState(false)
  const [editingService, setEditingService] = useState<any | null>(null)
  const [newHoliday, setNewHoliday] = useState({
    date: "",
    name: "",
  })
  const [isAddingHoliday, setIsAddingHoliday] = useState(false)

  useEffect(() => {
    // Simulate API call to fetch data
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // In a real app, you would fetch from your API
        // const servicesResponse = await fetch('/api/admin/services');
        // const servicesData = await servicesResponse.json();
        // const holidaysResponse = await fetch('/api/admin/holidays');
        // const holidaysData = await holidaysResponse.json();

        // Using mock data for demonstration
        setTimeout(() => {
          setServices(MOCK_SERVICES)
          setHolidays(MOCK_HOLIDAYS)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching data:", error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleServiceChange = (id: string, field: string, value: any) => {
    setServices(services.map((service) => (service.id === id ? { ...service, [field]: value } : service)))
  }

  const handleSaveServices = async () => {
    setIsSaving(true)
    try {
      // In a real app, you would call your API to update services
      // await fetch('/api/admin/services', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(services),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("Services updated successfully!")
    } catch (error) {
      console.error("Error saving services:", error)
      alert("Failed to update services")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditService = (service: any) => {
    setEditingService({ ...service })
  }

  const handleSaveServiceEdit = async () => {
    if (!editingService) return

    try {
      // In a real app, you would call your API to update the service
      // await fetch(`/api/admin/services/${editingService.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editingService),
      // });

      // Update local state
      setServices(services.map((service) => (service.id === editingService.id ? editingService : service)))

      setEditingService(null)
    } catch (error) {
      console.error("Error updating service:", error)
      alert("Failed to update service")
    }
  }

  const handleAddHoliday = async () => {
    if (!newHoliday.date || !newHoliday.name) {
      alert("Please provide both date and name for the holiday")
      return
    }

    setIsAddingHoliday(true)
    try {
      // In a real app, you would call your API to add the holiday
      // const response = await fetch('/api/admin/holidays', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newHoliday),
      // });
      // const data = await response.json();

      // Simulate API call and response
      await new Promise((resolve) => setTimeout(resolve, 800))
      const newId = `hol_${Date.now()}`

      // Add to local state
      setHolidays([
        ...holidays,
        {
          id: newId,
          date: new Date(newHoliday.date),
          name: newHoliday.name,
        },
      ])

      // Reset form
      setNewHoliday({ date: "", name: "" })
    } catch (error) {
      console.error("Error adding holiday:", error)
      alert("Failed to add holiday")
    } finally {
      setIsAddingHoliday(false)
    }
  }

  const handleDeleteHoliday = async (id: string) => {
    try {
      // In a real app, you would call your API to delete the holiday
      // await fetch(`/api/admin/holidays/${id}`, {
      //   method: 'DELETE',
      // });

      // Remove from local state
      setHolidays(holidays.filter((holiday) => holiday.id !== id))
    } catch (error) {
      console.error("Error deleting holiday:", error)
      alert("Failed to delete holiday")
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Settings</h1>
        <Badge className="bg-orange-600">Admin Access</Badge>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      ) : (
        <Tabs defaultValue="services" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="services">Services & Pricing</TabsTrigger>
            <TabsTrigger value="holidays">Holidays</TabsTrigger>
            <TabsTrigger value="system">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Services & Pricing</CardTitle>
                <CardDescription>Manage your service offerings and pricing structure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">Pricing Information</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      Changes to pricing will affect new reservations only. Existing reservations will maintain their
                      original pricing.
                    </AlertDescription>
                  </Alert>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Base Price (zł)</TableHead>
                        <TableHead>Additional Animal (zł)</TableHead>
                        <TableHead>Time Surcharge (zł)</TableHead>
                        <TableHead>Additional Time (zł)</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium">{service.name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={service.basePrice}
                              onChange={(e) =>
                                handleServiceChange(service.id, "basePrice", Number.parseFloat(e.target.value))
                              }
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={service.additionalAnimal}
                              onChange={(e) =>
                                handleServiceChange(service.id, "additionalAnimal", Number.parseFloat(e.target.value))
                              }
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={service.timeSurcharge}
                              onChange={(e) =>
                                handleServiceChange(service.id, "timeSurcharge", Number.parseFloat(e.target.value))
                              }
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={service.additionalTime}
                              onChange={(e) =>
                                handleServiceChange(service.id, "additionalTime", Number.parseFloat(e.target.value))
                              }
                              className="w-20"
                              disabled={service.name === "Nocleg"}
                            />
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={service.isActive}
                              onCheckedChange={(checked) => handleServiceChange(service.id, "isActive", checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => handleEditService(service)}>
                              Edit Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveServices}
                      className="bg-orange-600 hover:bg-orange-700"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Service Dialog */}
            {editingService && (
              <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Service Details</DialogTitle>
                    <DialogDescription>Update the details for {editingService.name} service</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="service-name">Service Name</Label>
                      <Input
                        id="service-name"
                        value={editingService.name}
                        onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="service-description">Description</Label>
                      <Input
                        id="service-description"
                        value={editingService.description}
                        onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                      />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="service-base-price">Base Price (zł)</Label>
                        <Input
                          id="service-base-price"
                          type="number"
                          value={editingService.basePrice}
                          onChange={(e) =>
                            setEditingService({ ...editingService, basePrice: Number.parseFloat(e.target.value) })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="service-additional-animal">Additional Animal Price (zł)</Label>
                        <Input
                          id="service-additional-animal"
                          type="number"
                          value={editingService.additionalAnimal}
                          onChange={(e) =>
                            setEditingService({
                              ...editingService,
                              additionalAnimal: Number.parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="service-time-surcharge">Time Surcharge (zł)</Label>
                        <Input
                          id="service-time-surcharge"
                          type="number"
                          value={editingService.timeSurcharge}
                          onChange={(e) =>
                            setEditingService({ ...editingService, timeSurcharge: Number.parseFloat(e.target.value) })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="service-additional-time">Additional Time Price (zł)</Label>
                        <Input
                          id="service-additional-time"
                          type="number"
                          value={editingService.additionalTime}
                          onChange={(e) =>
                            setEditingService({ ...editingService, additionalTime: Number.parseFloat(e.target.value) })
                          }
                          disabled={editingService.name === "Nocleg"}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="service-active"
                        checked={editingService.isActive}
                        onCheckedChange={(checked) => setEditingService({ ...editingService, isActive: checked })}
                      />
                      <Label htmlFor="service-active">Service Active</Label>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditingService(null)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveServiceEdit} className="bg-orange-600 hover:bg-orange-700">
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>

          <TabsContent value="holidays">
            <Card>
              <CardHeader>
                <CardTitle>Holiday Calendar</CardTitle>
                <CardDescription>Manage holidays and special days with pricing surcharges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800">Holiday Pricing</AlertTitle>
                    <AlertDescription className="text-amber-700">
                      Holidays and weekends have a 20% surcharge on all services. Add or remove holidays to adjust
                      pricing automatically.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Current Holidays</h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-orange-600 hover:bg-orange-700">
                          <Plus size={16} className="mr-2" />
                          Add Holiday
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Holiday</DialogTitle>
                          <DialogDescription>Add a new holiday to apply special pricing</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="holiday-date">Date</Label>
                            <Input
                              id="holiday-date"
                              type="date"
                              value={newHoliday.date}
                              onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="holiday-name">Holiday Name</Label>
                            <Input
                              id="holiday-name"
                              value={newHoliday.name}
                              onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                              placeholder="e.g. Christmas Day"
                            />
                          </div>
                        </div>

                        <DialogFooter>
                          <Button variant="outline" onClick={() => setNewHoliday({ date: "", name: "" })}>
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddHoliday}
                            className="bg-orange-600 hover:bg-orange-700"
                            disabled={isAddingHoliday}
                          >
                            {isAddingHoliday ? (
                              <>
                                <Loader2 size={16} className="mr-2 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              "Add Holiday"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Holiday Name</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {holidays.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                              No holidays defined yet
                            </TableCell>
                          </TableRow>
                        ) : (
                          holidays
                            .sort((a, b) => a.date.getTime() - b.date.getTime())
                            .map((holiday) => (
                              <TableRow key={holiday.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-orange-600" />
                                    {format(new Date(holiday.date), "MMMM d, yyyy")}
                                  </div>
                                </TableCell>
                                <TableCell>{holiday.name}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteHoliday(holiday.id)}
                                    className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                  >
                                    <Trash2 size={16} />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure global system settings and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Settings</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <Switch id="email-notifications" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sms-notifications">SMS Notifications</Label>
                        <Switch id="sms-notifications" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Reservation Settings</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="advance-days">Minimum Advance Booking (days)</Label>
                        <Input id="advance-days" type="number" defaultValue={1} className="w-20" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="max-future-days">Maximum Future Booking (days)</Label>
                        <Input id="max-future-days" type="number" defaultValue={90} className="w-20" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Business Hours</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="business-start">Opening Time</Label>
                        <Input id="business-start" type="time" defaultValue="08:00" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business-end">Closing Time</Label>
                        <Input id="business-end" type="time" defaultValue="20:00" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      <Save size={16} className="mr-2" />
                      Save Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
