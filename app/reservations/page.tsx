"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Calendar } from "@/app/reservations/calendar"
import { PetProfile } from "@/components/pet-profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TimePickerInput } from "@/components/time-picker-input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Plus,
  Save,
  Trash2,
  MapPin,
  CalendarIcon,
  DollarSign,
  AlertCircle,
  Dog,
  Cat,
  Moon,
  Sunrise,
  Loader2,
  Download,
} from "lucide-react"
import { format, isWeekend, differenceInDays } from "date-fns"
import { CostBreakdown } from "@/components/cost-breakdown"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { calculateDistance } from "@/lib/distance-calculator"
import { MultiTimeSelector } from "@/components/multi-time-selector"
import { ChatWidget } from "@/components/chat-widget"

const SERVICE_TYPES = ["Nocleg", "Spacer", "Wyzyta Domowa"]
const POLISH_HOLIDAYS_2025 = [
  "2025-01-01", // New Year's Day
  "2025-01-06", // Epiphany
  "2025-04-20", // Easter Sunday
  "2025-04-21", // Easter Monday
  "2025-05-01", // Labor Day
  "2025-05-03", // Constitution Day
  "2025-06-08", // Pentecost Sunday
  "2025-06-19", // Corpus Christi
  "2025-08-15", // Assumption of Mary
  "2025-11-01", // All Saints' Day
  "2025-11-11", // Independence Day
  "2025-12-25", // Christmas Day
  "2025-12-26", // Second Day of Christmas
]

// Base prices
const PRICES = {
  Nocleg: {
    basePrice: 91, // 40 zł for 30 min (1st animal)
    additionalTime: 0,
    weekendHoliday: 101,
    additionalAnimal: 61, // 20 zł for 2nd animal
    timeSurcharge: 10, // Before 8 AM/after 8 PM
    basePriceCat: 71,
    additionalCat: 39,
  },
  "Wyzyta Domowa": {
    basePrice: 45, // 40 zł for 30 min (1st animal)
    additionalTime: 20,
    weekendHoliday: 60,
    additionalAnimal: 25, // 20 zł for 2nd animal
    timeSurcharge: 10, // Before 8 AM/after 8 PM
    basePriceCat: 40,
    additionalCat: 15,
  },
  Spacer: {
    basePrice: 41, // 40 zł for 30 min (1st animal)
    additionalTime: 21,
    weekendHoliday: 52,
    additionalAnimal: 21, // 20 zł for 2nd animal
    timeSurcharge: 10, // Before 8 AM/after 8 PM
    basePriceCat: 20,
    additionalCat: 10,
  },
}

interface TimeSlot {
  id: string
  time: string
  isOutsideNormalHours: boolean
  duration: string
}

interface DateWithTimes {
  date: Date
  times: TimeSlot[]
  isSpecialDay: boolean
}

export default function ReservationPage() {
  // User information
  const [userInfo, setUserInfo] = useState({
    name: "",
    surname: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
  })

  // Saved profiles
  const [savedProfiles, setSavedProfiles] = useState<any[]>([])
  const [selectedProfileIndex, setSelectedProfileIndex] = useState<number | null>(null)

  // Pets
  const [pets, setPets] = useState<any[]>([])

  // Service selection
  const [selectedService, setSelectedService] = useState(SERVICE_TYPES[0])

  // Dates and times
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [pickupTime, setPickupTime] = useState("12:00")
  const [dropoffTime, setDropoffTime] = useState("12:00")
  const [walkDuration, setWalkDuration] = useState("30 minutes")
  const [customDuration, setCustomDuration] = useState("45")

  // New state for multiple time slots per day
  const [datesWithTimes, setDatesWithTimes] = useState<DateWithTimes[]>([])

  // UI state
  const [isUserRegistered, setIsUserRegistered] = useState(false)
  const [showUserForm, setShowUserForm] = useState(true)
  const [distance, setDistance] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("user-info")
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false)
  const [distanceError, setDistanceError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Language
  const [language, setLanguage] = useState<"en" | "pl">("en")

  // Form validation
  const [formSubmitted, setFormSubmitted] = useState(false)

  // Calculate distance when address changes
  useEffect(() => {
    // Reset distance-related states
    setDistance(null)
    setDistanceError(null)

    if (
      (selectedService === "Spacer" || selectedService === "Wyzyta Domowa") &&
      userInfo.address &&
      userInfo.city &&
      userInfo.postalCode
    ) {
      const fullAddress = `${userInfo.address}, ${userInfo.postalCode} ${userInfo.city}`
      const dogHotelAddress = "Madalińskiego 67/11, 02-549 Warsaw"

      // Set loading state
      setIsCalculatingDistance(true)

      // Call the geocoding API
      calculateDistance(fullAddress, dogHotelAddress)
        .then((calculatedDistance) => {
          setDistance(calculatedDistance)
          setDistanceError(null)
        })
        .catch((error) => {
          console.error("Error calculating distance:", error)
          setDistanceError("Could not calculate distance. Please check your address.")
        })
        .finally(() => {
          setIsCalculatingDistance(false)
        })
    }
  }, [userInfo.address, userInfo.city, userInfo.postalCode, selectedService])

  // Initialize dates with times when selected dates change
  useEffect(() => {
    if (selectedService === "Spacer" || selectedService === "Wyzyta Domowa") {
      // Create or update datesWithTimes based on selectedDates
      const updatedDatesWithTimes = selectedDates.map((date) => {
        // Check if this date already exists in datesWithTimes
        const existingDateWithTimes = datesWithTimes.find((item) => isSameDay(item.date, date))

        if (existingDateWithTimes) {
          return existingDateWithTimes
        }

        // Create new entry with default time
        return {
          date,
          times: [
            {
              id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
              time: "12:00",
              isOutsideNormalHours: isOutsideNormalHours("12:00"),
              duration: "30 minutes",
            },
          ],
          isSpecialDay: isSpecialDay(date),
        }
      })

      setDatesWithTimes(updatedDatesWithTimes)
    }
  }, [selectedDates, selectedService])

  // Toggle user registration status
  const toggleUserRegistration = () => {
    setIsUserRegistered(!isUserRegistered)
    setShowUserForm(!isUserRegistered)
  }

  // Load saved settings
  useEffect(() => {
    const stored = localStorage.getItem("pet-profiles")
    if (stored) {
      setSavedProfiles(JSON.parse(stored))
    }
  }, [])

  const addPet = () => {
    setPets([
      ...pets,
      {
        id: Date.now().toString(),
        type: "dog",
        weight: "<5 kg",
        name: "",
        sex: "Male",
        age: "1",
      },
    ])
  }

  const updatePet = (id: string, field: string, value: string) => {
    setPets(pets.map((pet) => (pet.id === id ? { ...pet, [field]: value } : pet)))
  }

  const removePet = (id: string) => {
    setPets(pets.filter((pet) => pet.id !== id))
  }

  const saveSettings = () => {
    setIsSaving(true)

    // Create a profile object with user info and pets
    const profile = {
      ...userInfo,
      pets: [...pets],
      savedAt: new Date().toISOString(),
      name: userInfo.name || `Profile ${savedProfiles.length + 1}`,
    }

    // Get existing profiles
    const existingProfiles = [...savedProfiles]

    if (selectedProfileIndex !== null) {
      // Update existing profile
      existingProfiles[selectedProfileIndex] = profile
    } else {
      // Add new profile
      existingProfiles.push(profile)
    }

    // Save to localStorage
    localStorage.setItem("pet-profiles", JSON.stringify(existingProfiles))
    setSavedProfiles(existingProfiles)

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      alert("Settings saved successfully!")
    }, 800)
  }

  const loadSettings = (profileIndex: number) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const profile = savedProfiles[profileIndex]
      if (profile) {
        setUserInfo({
          name: profile.name || "",
          surname: profile.surname || "",
          phone: profile.phone || "",
          email: profile.email || "",
          address: profile.address || "",
          city: profile.city || "",
          postalCode: profile.postalCode || "",
        })

        setPets(profile.pets || [])
        setSelectedProfileIndex(profileIndex)
      }
      setIsLoading(false)
    }, 600)
  }

  const deleteProfile = (profileIndex: number) => {
    const updatedProfiles = [...savedProfiles]
    updatedProfiles.splice(profileIndex, 1)
    setSavedProfiles(updatedProfiles)
    localStorage.setItem("pet-profiles", JSON.stringify(updatedProfiles))

    if (selectedProfileIndex === profileIndex) {
      setSelectedProfileIndex(null)
    } else if (selectedProfileIndex !== null && selectedProfileIndex > profileIndex) {
      setSelectedProfileIndex(selectedProfileIndex - 1)
    }
  }

  const handleDateSelect = (dates: Date[]) => {
    if (selectedService === "Nocleg") {
      if (dates.length === 1) {
        setStartDate(dates[0])
        setEndDate(null)
      } else if (dates.length > 1) {
        setStartDate(dates[0])
        setEndDate(dates[dates.length - 1])
      }
    } else {
      setSelectedDates(dates)
    }
  }

  // Helper function to check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  // Check if a date is a weekend or holiday
  const isSpecialDay = (date: Date) => {
    // Check if it's a weekend
    if (isWeekend(date)) return true

    // Check if it's a Polish holiday
    const dateString = format(date, "yyyy-MM-dd")
    return POLISH_HOLIDAYS_2025.includes(dateString)
  }

  // Check if a time is outside normal hours (before 8 AM or after 8 PM)
  const isOutsideNormalHours = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number)
    return hours < 8 || hours >= 20
  }

  // Handle time slot changes for a specific date
  const handleTimeSlotChange = (date: Date, newTimes: TimeSlot[]) => {
    setDatesWithTimes((prevDates) =>
      prevDates.map((dateWithTimes) =>
        isSameDay(dateWithTimes.date, date) ? { ...dateWithTimes, times: newTimes } : dateWithTimes,
      ),
    )
  }

  // Calculate the total cost
  const calculateCost = useMemo(() => {
    let totalCost = 0
    const breakdown = []

    // If no pets or no dates selected, return 0
    if (
      pets.length === 0 ||
      (selectedService === "Nocleg" && (!startDate || !endDate)) ||
      (selectedService !== "Nocleg" && selectedDates.length === 0)
    ) {
      return { totalCost: 0, breakdown: [] }
    }

    const servicePrice = PRICES[selectedService as keyof typeof PRICES]

    // Calculate base cost based on service type
    if (selectedService === "Nocleg" && startDate && endDate) {
      const nights = differenceInDays(endDate, startDate)

      // Check for weekend/holiday surcharge
      let specialDayCount = 0
      const currentDate = new Date(startDate)

      while (currentDate <= endDate) {
        if (isSpecialDay(currentDate)) {
          specialDayCount++
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Base cost for first pet
      const baseCost = (nights - specialDayCount) * servicePrice.basePrice
      if (baseCost > 0) {
        totalCost += baseCost
        breakdown.push({
          description: `${nights - specialDayCount} night(s) for first pet on regular days`,
          amount: baseCost,
        })
      }

      // Weekends/holidays price for first pet
      const specialDayCost = specialDayCount * servicePrice.weekendHoliday
      if (specialDayCost > 0) {
        totalCost += specialDayCost
        breakdown.push({
          description: `${specialDayCount} night(s) for first pet on weekend/holiday`,
          amount: specialDayCost,
        })
      }

      // Additional pets
      if (pets.length > 1) {
        const additionalPetsCost = nights * servicePrice.additionalAnimal * (pets.length - 1)
        totalCost += additionalPetsCost
        breakdown.push({
          description: `${nights} night(s) for ${pets.length - 1} additional pet(s)`,
          amount: additionalPetsCost,
        })
      }

      // Check for time surcharges
      if (isOutsideNormalHours(dropoffTime)) {
        totalCost += servicePrice.timeSurcharge
        breakdown.push({
          description: `Surcharge for drop-off outside 8 AM - 8 PM`,
          amount: servicePrice.timeSurcharge,
        })
      }

      if (isOutsideNormalHours(pickupTime)) {
        totalCost += servicePrice.timeSurcharge
        breakdown.push({
          description: `Surcharge for pick-up outside 8 AM - 8 PM`,
          amount: servicePrice.timeSurcharge,
        })
      }
    } else if ((selectedService === "Spacer" || selectedService === "Wyzyta Domowa") && datesWithTimes.length > 0) {
      // Calculate cost for each time slot based on its duration
      let totalRegularCost = 0
      let totalSpecialCost = 0
      let totalSpecialCostAdditionalPet = 0
      let totalRegularCostAdditionalPet = 0
      let totalDurationMultiplier = 0
      let regularDayDurationMultiplier = 0
      let specialDayDurationMultiplier = 0

      datesWithTimes.forEach((dateWithTimes) => {
        const isSpecial = dateWithTimes.isSpecialDay

        dateWithTimes.times.forEach((timeSlot) => {
          let slotDurationMultiplier = 1
          if (timeSlot.duration === "1 hour") {
            slotDurationMultiplier = 2
          } else if (timeSlot.duration === "1.5 hours") {
            slotDurationMultiplier = 3
          } else if (timeSlot.duration === "2 hours") {
            slotDurationMultiplier = 4
          } else if (timeSlot.duration === "2.5 hours") {
            slotDurationMultiplier = 5
          } else if (timeSlot.duration === "3 hours") {
            slotDurationMultiplier = 6
          } else if (timeSlot.duration === "3.5 hours") {
            slotDurationMultiplier = 7
          } else if (timeSlot.duration === "4 hours") {
            slotDurationMultiplier = 8
          } else if (timeSlot.duration === "4.5 hours") {
            slotDurationMultiplier = 9
          } else if (timeSlot.duration === "5 hours") {
            slotDurationMultiplier = 10
          } else if (timeSlot.duration === "5.5 hours") {
            slotDurationMultiplier = 11
          } else if (timeSlot.duration === "6 hours") {
            slotDurationMultiplier = 12
          } else if (timeSlot.duration === "6.5 hours") {
            slotDurationMultiplier = 13
          } else if (timeSlot.duration === "7 hours") {
            slotDurationMultiplier = 14
          } else if (timeSlot.duration === "7.5 hours") {
            slotDurationMultiplier = 15
          } else if (timeSlot.duration === "8 hours") {
            slotDurationMultiplier = 16
          }

          totalDurationMultiplier += slotDurationMultiplier

          if (isSpecial) {
            totalSpecialCost += servicePrice.weekendHoliday * slotDurationMultiplier
            totalSpecialCostAdditionalPet +=
              servicePrice.additionalAnimal * 1.2 * slotDurationMultiplier * (pets.length - 1)
            specialDayDurationMultiplier += slotDurationMultiplier
          } else {
            totalRegularCost += servicePrice.basePrice * slotDurationMultiplier
            totalRegularCostAdditionalPet += servicePrice.additionalAnimal * slotDurationMultiplier * (pets.length - 1)
            regularDayDurationMultiplier += slotDurationMultiplier
          }
        })
      })

      // Base cost for first pet
      if (totalRegularCost > 0) {
        totalCost += totalRegularCost
        breakdown.push({
          description: `30 min for 1 pet: ${regularDayDurationMultiplier}*${servicePrice.basePrice.toFixed(2)} zł`,
          amount: totalRegularCost,
        })
      }

      // Special cost for first pet
      if (totalSpecialCost > 0) {
        totalCost += totalSpecialCost
        breakdown.push({
          description: `30 min for 1 pet on Weekend/Holiday : ${specialDayDurationMultiplier}*${servicePrice.weekendHoliday.toFixed(2)} zł`,
          amount: totalSpecialCost,
        })
      }

      // Additional pets
      if (pets.length > 1) {
        // Count regular and special days
        let regularDayCount = 0
        let specialDayCount = 0

        // Count total time slots and outside normal hours slots
        let totalTimeSlots = 0
        let outsideHoursTimeSlots = 0

        datesWithTimes.forEach((dateWithTimes) => {
          if (dateWithTimes.isSpecialDay) {
            specialDayCount++
          } else {
            regularDayCount++
          }

          totalTimeSlots += dateWithTimes.times.length
          outsideHoursTimeSlots += dateWithTimes.times.filter((t) => t.isOutsideNormalHours).length
        })

        // Regular days
        if (regularDayCount > 0) {
          totalCost += totalRegularCostAdditionalPet
          breakdown.push({
            description: `${pets.length - 1} additional pet(s) for ${regularDayCount} day(s): ${pets.length - 1}*${regularDayDurationMultiplier}*${servicePrice.additionalAnimal.toFixed(2)} zł`,
            amount: totalRegularCostAdditionalPet,
          })
        }

        // Special days
        if (specialDayCount > 0) {
          totalCost += totalSpecialCostAdditionalPet
          breakdown.push({
            description: `${pets.length - 1} additional pet(s) for ${specialDayCount} weekend/holiday(s): ${pets.length - 1}*${specialDayDurationMultiplier}*${servicePrice.additionalAnimal * (1.2).toFixed(2)} zł`,
            amount: totalSpecialCostAdditionalPet,
          })
        }
      }

      // Time surcharges for outside normal hours
      // Count total time slots and outside normal hours slots
      let totalTimeSlots = 0
      let outsideHoursTimeSlots = 0

      datesWithTimes.forEach((dateWithTimes) => {
        totalTimeSlots += dateWithTimes.times.length
        outsideHoursTimeSlots += dateWithTimes.times.filter((t) => t.isOutsideNormalHours).length
      })

      if (outsideHoursTimeSlots > 0) {
        const timeSurcharge = servicePrice.timeSurcharge * outsideHoursTimeSlots
        totalCost += timeSurcharge
        breakdown.push({
          description: `Surcharge for ${outsideHoursTimeSlots} time slot(s) outside 8 AM - 8 PM`,
          amount: timeSurcharge,
        })
      }

      // Distance surcharge
      if (distance && distance > 5) {
        const extraDistance = distance - 5
        const distanceSurcharge = extraDistance * 1.5 * totalTimeSlots
        totalCost += distanceSurcharge
        breakdown.push({
          description: `Distance surcharge for ${extraDistance.toFixed(1)} km (${totalTimeSlots} visit(s))`,
          amount: distanceSurcharge,
        })
      }
    }

    return { totalCost, breakdown }
  }, [
    pets,
    selectedService,
    startDate,
    endDate,
    selectedDates,
    datesWithTimes,
    walkDuration,
    customDuration,
    dropoffTime,
    pickupTime,
    distance,
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)

    // Validate form
    if (pets.length === 0) {
      alert("Please add at least one pet")
      return
    }

    if (selectedService === "Nocleg" && (!startDate || !endDate)) {
      alert("Please select a date range for the stay")
      return
    }

    if ((selectedService === "Spacer" || selectedService === "Wyzyta Domowa") && selectedDates.length === 0) {
      alert("Please select at least one date")
      return
    }

    if (
      (selectedService === "Spacer" || selectedService === "Wyzyta Domowa") &&
      (!userInfo.address || !userInfo.city || !userInfo.postalCode)
    ) {
      alert("Please provide your full address for distance calculation")
      return
    }

    // Check if all dates have at least one time slot
    if (selectedService === "Spacer" || selectedService === "Wyzyta Domowa") {
      const datesMissingTimes = datesWithTimes.filter((d) => d.times.length === 0)
      if (datesMissingTimes.length > 0) {
        alert(`Please add at least one time slot for each selected date`)
        return
      }
    }

    // Prepare reservation data
    const reservationData = {
      userInfo: isUserRegistered ? { registered: true } : userInfo,
      pets,
      service: selectedService,
      dates:
        selectedService === "Nocleg"
          ? {
              startDate: startDate ? format(startDate, "yyyy-MM-dd") : null,
              endDate: endDate ? format(endDate, "yyyy-MM-dd") : null,
              pickupTime,
              dropoffTime,
            }
          : {
              datesWithTimes: datesWithTimes.map((dateWithTime) => ({
                ...dateWithTime,
                date: format(dateWithTime.date, "yyyy-MM-dd"),
              })),
            },
      cost: calculateCost.totalCost,
    }

    try {
      // Show loading state
      setIsSaving(true)

      // Send data to API
      const response = await fetch("/api/reservations/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to save reservation")
      }

      // Success - with a note if calendar failed
      if (result.calendarSuccess === false) {
        alert(
          "Reservation submitted successfully! Your booking has been saved to our database, but could not be added to our calendar. Our staff will handle this manually.",
        )
      } else {
        alert("Reservation submitted successfully! Your booking has been added to our calendar.")
      }

      // Store the user's email in localStorage for the bookings page
      if (userInfo.email) {
        localStorage.setItem("userEmail", userInfo.email)
      }

      // Redirect to the bookings page
      window.location.href = "/bookings"

      // Reset form or redirect to confirmation page
      // You could add code here to reset the form or redirect
    } catch (error) {
      console.error("Error saving reservation:", error)
      alert(`Failed to submit reservation: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setFormSubmitted(false) // Reset form submission state when changing tabs
  }

  // Function to manually trigger distance calculation
  const recalculateDistance = () => {
    if (userInfo.address && userInfo.city && userInfo.postalCode) {
      const fullAddress = `${userInfo.address}, ${userInfo.postalCode} ${userInfo.city}`
      const dogHotelAddress = "Madalińskiego 67/11, 02-549 Warsaw"

      setIsCalculatingDistance(true)
      setDistanceError(null)

      calculateDistance(fullAddress, dogHotelAddress)
        .then((calculatedDistance) => {
          setDistance(calculatedDistance)
        })
        .catch((error) => {
          console.error("Error calculating distance:", error)
          setDistanceError("Could not calculate distance. Please check your address.")
        })
        .finally(() => {
          setIsCalculatingDistance(false)
        })
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <DollarSign size={20} className="text-[#C76E00] mr-2" />
          <div className="text-lg font-medium">
            Total Cost: <span className="text-[#C76E00]">{calculateCost.totalCost.toFixed(2)} zł</span>
          </div>
        </div>

        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              language === "en" ? "bg-[#C76E00] text-white" : "bg-white text-gray-900 hover:bg-gray-100"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage("pl")}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              language === "pl" ? "bg-[#C76E00] text-white" : "bg-white text-gray-900 hover:bg-gray-100"
            }`}
          >
            PL
          </button>
        </div>
      </div>

      <Card className="w-full max-w-4xl mx-auto shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-[#C76E00] to-[#a85b00] text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Dog Hotel Reservation</CardTitle>
          <CardDescription className="text-orange-100">Book a stay or service for your furry friend</CardDescription>
        </CardHeader>

        <Tabs defaultValue="user-info" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-4 mx-6 mt-6">
            <TabsTrigger value="user-info" className="flex items-center gap-2">
              <span className="hidden sm:inline">Your Information</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="pets" className="flex items-center gap-2">
              <span className="hidden sm:inline">Pet Details</span>
              <span className="sm:hidden">Pets</span>
            </TabsTrigger>
            <TabsTrigger value="service" className="flex items-center gap-2">
              <span className="hidden sm:inline">Service & Dates</span>
              <span className="sm:hidden">Service</span>
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <span className="hidden sm:inline">Cost & Summary</span>
              <span className="sm:hidden">Summary</span>
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="user-info" className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Your Information</h3>
                  <Button type="button" variant="outline" size="sm" onClick={toggleUserRegistration}>
                    {isUserRegistered ? "Edit Info" : "I'm registered"}
                  </Button>
                </div>

                {showUserForm && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={userInfo.name}
                          onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                          required={!isUserRegistered}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="surname">Surname</Label>
                        <Input
                          id="surname"
                          value={userInfo.surname}
                          onChange={(e) => setUserInfo({ ...userInfo, surname: e.target.value })}
                          required={!isUserRegistered}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={userInfo.phone}
                          onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                          required={!isUserRegistered}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={userInfo.email}
                          onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                          required={!isUserRegistered}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={userInfo.address}
                        onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
                        required={!isUserRegistered}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={userInfo.city}
                          onChange={(e) => setUserInfo({ ...userInfo, city: e.target.value })}
                          required={!isUserRegistered}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          value={userInfo.postalCode}
                          onChange={(e) => setUserInfo({ ...userInfo, postalCode: e.target.value })}
                          required={!isUserRegistered}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4">
                  <h3 className="text-lg font-medium">Saved Profiles</h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={saveSettings}
                      className="flex items-center gap-2"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save Profile
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => loadSettings(selectedProfileIndex || 0)}
                      className="flex items-center gap-2"
                      disabled={isLoading || savedProfiles.length === 0 || selectedProfileIndex === null}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Download size={16} />
                          Load Profile
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {savedProfiles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedProfiles.map((profile, index) => (
                      <Card
                        key={index}
                        className={`overflow-hidden ${selectedProfileIndex === index ? "ring-2 ring-orange-500" : ""} cursor-pointer hover:bg-orange-50/50 transition-colors`}
                        onClick={() => loadSettings(index)}
                      >
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base font-medium">
                              {profile.name} {profile.surname}
                            </CardTitle>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteProfile(index)
                                }}
                                className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                              >
                                <Trash2 size={16} />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </div>
                          <CardDescription className="text-xs">
                            {profile.pets?.length || 0} pets · Saved {format(new Date(profile.savedAt), "PP")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="text-sm space-y-1">
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-muted-foreground" />
                              <span className="truncate">
                                {profile.address}, {profile.postalCode} {profile.city}
                              </span>
                            </div>
                            {profile.pets?.map((pet: any, petIndex: number) => (
                              <div key={petIndex} className="flex items-center gap-2">
                                {pet.type === "dog" ? (
                                  <Dog size={14} className="text-muted-foreground" />
                                ) : (
                                  <Cat size={14} className="text-muted-foreground" />
                                )}
                                <span>
                                  {pet.name || `Pet ${petIndex + 1}`} ({pet.weight})
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <p className="text-muted-foreground">
                      No profiles saved yet. Fill in your information and click "Save Profile".
                    </p>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <Button type="button" onClick={() => setActiveTab("pets")}>
                    Continue to Pet Details
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pets" className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Pet Information</h3>
                  <Button
                    type="button"
                    onClick={addPet}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Pet
                  </Button>
                </div>

                {pets.length === 0 ? (
                  <div className="text-center py-12 border border-dashed rounded-lg">
                    <div className="flex justify-center mb-4">
                      {Math.random() > 0.5 ? (
                        <Dog size={48} className="text-orange-300" />
                      ) : (
                        <Cat size={48} className="text-orange-300" />
                      )}
                    </div>
                    <p className="text-muted-foreground mb-4">No pets added yet.</p>
                    <Button
                      type="button"
                      onClick={addPet}
                      variant="default"
                      size="sm"
                      className="flex items-center gap-2 mx-auto"
                    >
                      <Plus size={16} />
                      Add Your First Pet
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pets.map((pet) => (
                      <PetProfile
                        key={pet.id}
                        pet={pet}
                        onUpdate={(field, value) => updatePet(pet.id, field, value)}
                        onRemove={() => removePet(pet.id)}
                      />
                    ))}
                  </div>
                )}

                {pets.length > 0 && (
                  <div className="flex justify-end pt-4 mb-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={saveSettings}
                      className="flex items-center gap-2"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save Profile
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("user-info")}>
                    Back to Info
                  </Button>
                  <Button type="button" onClick={() => setActiveTab("service")}>
                    Continue to Service
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="service" className="p-6">
              <div className="space-y-6">
                {/* Service Type Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Service Type</h3>
                  <RadioGroup
                    value={selectedService}
                    onValueChange={(value) => {
                      setSelectedService(value)
                      // Reset dates when changing service type
                      setSelectedDates([])
                      setStartDate(null)
                      setEndDate(null)
                      setDatesWithTimes([])
                    }}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    {SERVICE_TYPES.map((service) => (
                      <div key={service} className="flex items-center space-x-2">
                        <RadioGroupItem value={service} id={service} />
                        <Label htmlFor={service} className="flex items-center gap-2">
                          {service === "Nocleg" && <Moon size={16} />}
                          {service === "Spacer" && <Sunrise size={16} />}
                          {service === "Wyzyta Domowa" && <MapPin size={16} />}
                          {service}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                      <AlertCircle size={16} />
                      Service Description
                    </h4>
                    {selectedService === "Nocleg" && (
                      <p className="text-sm text-orange-700">
                        Overnight stay at our dog hotel. Includes feeding, playtime, and comfortable accommodation.
                      </p>
                    )}
                    {selectedService === "Spacer" && (
                      <p className="text-sm text-orange-700">
                        We'll pick up your pet for a walk at the scheduled time and return them afterward.
                      </p>
                    )}
                    {selectedService === "Wyzyta Domowa" && (
                      <p className="text-sm text-orange-700">
                        We'll visit your home to take care of your pet at the scheduled time.
                      </p>
                    )}
                  </div>
                </div>

                {/* Address confirmation for Spacer and Wyzyta Domowa */}
                {(selectedService === "Spacer" || selectedService === "Wyzyta Domowa") && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Address Confirmation</h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-sm mb-2">
                        <span className="font-medium">Your address:</span>{" "}
                        <Button
                          variant="link"
                          className="p-0 h-auto text-sm font-normal underline"
                          onClick={() => setActiveTab("user-info")}
                        >
                          {userInfo.address}, {userInfo.postalCode} {userInfo.city}
                        </Button>
                      </div>

                      {isCalculatingDistance ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 size={14} className="animate-spin" />
                          Calculating distance...
                        </div>
                      ) : distanceError ? (
                        <div className="flex flex-col gap-2">
                          <p className="text-sm text-red-500">{distanceError}</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={recalculateDistance}
                            className="self-start"
                          >
                            Try Again
                          </Button>
                        </div>
                      ) : distance !== null ? (
                        <div className="text-sm">
                          <span className="font-medium">Distance from our location:</span> {distance.toFixed(1)} km
                          {distance > 5 && (
                            <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
                              +{((distance - 5) * 1.5).toFixed(2)} zł per visit
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={recalculateDistance}
                          className="mt-2"
                        >
                          Calculate Distance
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Calendar Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Select Dates</h3>

                  {selectedService === "Nocleg" && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">Please select a range of dates for the stay</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Calendar
                            mode="range"
                            onDateSelect={handleDateSelect}
                            selectedDates={startDate && endDate ? [startDate, endDate] : startDate ? [startDate] : []}
                            polishHolidays={POLISH_HOLIDAYS_2025}
                          />
                        </div>

                        <div className="space-y-4">
                          {(startDate || endDate) && (
                            <div className="p-4 bg-muted rounded-lg">
                              <h4 className="font-medium mb-2">Stay Details</h4>
                              {startDate && (
                                <div className="text-sm flex items-center gap-2">
                                  <CalendarIcon size={14} className="text-muted-foreground" />
                                  Check-in: {format(startDate, "PPP")}
                                  {isSpecialDay(startDate) && (
                                    <Badge
                                      variant="outline"
                                      className="ml-auto bg-amber-50 text-amber-700 border-amber-200"
                                    >
                                      Weekend/holiday price
                                    </Badge>
                                  )}
                                </div>
                              )}
                              {endDate && (
                                <div className="text-sm flex items-center gap-2">
                                  <CalendarIcon size={14} className="text-muted-foreground" />
                                  Check-out: {format(endDate, "PPP")}
                                  {isSpecialDay(endDate) && (
                                    <Badge
                                      variant="outline"
                                      className="ml-auto bg-amber-50 text-amber-700 border-amber-200"
                                    >
                                      Weekend/holiday price
                                    </Badge>
                                  )}
                                </div>
                              )}
                              {startDate && endDate && (
                                <p className="text-sm mt-2 font-medium">
                                  Total: {differenceInDays(endDate, startDate)} night(s)
                                </p>
                              )}
                            </div>
                          )}

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="dropoff-time" className="flex items-center justify-between">
                                Drop-off Time
                                {isOutsideNormalHours(dropoffTime) && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge
                                          variant="outline"
                                          className="bg-amber-50 text-amber-700 border-amber-200"
                                        >
                                          +10 zł
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="text-xs">Surcharge for times before 8 AM or after 8 PM</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </Label>
                              <TimePickerInput id="dropoff-time" value={dropoffTime} onChange={setDropoffTime} />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="pickup-time" className="flex items-center justify-between">
                                Pick-up Time
                                {isOutsideNormalHours(pickupTime) && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge
                                          variant="outline"
                                          className="bg-amber-50 text-amber-700 border-amber-200"
                                        >
                                          +10 zł
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="text-xs">Surcharge for times before 8 AM or after 8 PM</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </Label>
                              <TimePickerInput id="pickup-time" value={pickupTime} onChange={setPickupTime} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {(selectedService === "Spacer" || selectedService === "Wyzyta Domowa") && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Please select multiple dates (they don't have to be consecutive)
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Calendar
                            mode="multiple"
                            onDateSelect={handleDateSelect}
                            selectedDates={selectedDates}
                            polishHolidays={POLISH_HOLIDAYS_2025}
                          />
                        </div>

                        <div className="space-y-4">
                          {selectedDates.length > 0 && (
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">Selected Dates & Times</h4>
                                <Badge>{selectedDates.length} day(s)</Badge>
                              </div>

                              <ScrollArea className="h-[250px] pr-4">
                                <div className="space-y-3">
                                  {datesWithTimes.map((dateWithTimes) => (
                                    <MultiTimeSelector
                                      key={dateWithTimes.date.toISOString()}
                                      date={dateWithTimes.date}
                                      times={dateWithTimes.times}
                                      onChange={handleTimeSlotChange}
                                      isOutsideNormalHours={isOutsideNormalHours}
                                      surchargeAmount={selectedService === "Spacer" ? 20 : 40}
                                    />
                                  ))}
                                </div>
                              </ScrollArea>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("pets")}>
                    Back to Pet Details
                  </Button>
                  <Button type="button" onClick={() => setActiveTab("summary")}>
                    Continue to Summary
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="summary" className="p-6">
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Reservation Summary</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Service Details</h4>
                      <div className="space-y-2 text-sm">
                        <p className="flex items-center gap-2">
                          <span className="font-medium">Service:</span>
                          {selectedService === "Nocleg" && <Moon size={16} />}
                          {selectedService === "Spacer" && <Sunrise size={16} />}
                          {selectedService === "Wyzyta Domowa" && <MapPin size={16} />}
                          {selectedService}
                        </p>

                        {selectedService === "Nocleg" && startDate && endDate && (
                          <>
                            <p>
                              <span className="font-medium">Check-in:</span> {format(startDate, "PPP")} at {dropoffTime}
                            </p>
                            <p>
                              <span className="font-medium">Check-out:</span> {format(endDate, "PPP")} at {pickupTime}
                            </p>
                            <p>
                              <span className="font-medium">Duration:</span> {differenceInDays(endDate, startDate)}{" "}
                              night(s)
                            </p>
                          </>
                        )}

                        {(selectedService === "Spacer" || selectedService === "Wyzyta Domowa") &&
                          datesWithTimes.length > 0 && (
                            <>
                              <p>
                                <span className="font-medium">Dates:</span> {datesWithTimes.length} day(s)
                              </p>
                              <p>
                                <span className="font-medium">Duration:</span> Individual per time slot
                              </p>

                              <div className="mt-2">
                                <p className="font-medium mb-1">Selected dates:</p>
                                <ScrollArea className="h-[100px] pr-4">
                                  {datesWithTimes.map((dateWithTimes) => (
                                    <div key={dateWithTimes.date.toISOString()} className="mb-2">
                                      <p className="flex items-center justify-between">
                                        <span>{format(dateWithTimes.date, "EEE, MMM d")}</span>
                                        {dateWithTimes.isSpecialDay && (
                                          <Badge
                                            variant="outline"
                                            className="bg-amber-50 text-amber-700 border-amber-200"
                                          >
                                            Weekend/holiday price
                                          </Badge>
                                        )}
                                      </p>
                                      <div className="ml-4 text-xs text-muted-foreground">
                                        {dateWithTimes.times.map((timeSlot) => (
                                          <div key={timeSlot.id} className="mb-1">
                                            {timeSlot.time} ({timeSlot.duration}){timeSlot.isOutsideNormalHours && " *"}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </ScrollArea>
                              </div>

                              {distance !== null && (
                                <p>
                                  <span className="font-medium">Distance:</span> {distance.toFixed(1)} km
                                </p>
                              )}
                            </>
                          )}
                      </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Pet Information</h4>
                      {pets.length > 0 ? (
                        <div className="space-y-2 text-sm">
                          {pets.map((pet, index) => (
                            <div key={pet.id} className="flex items-center gap-2">
                              {pet.type === "dog" ? (
                                <Dog size={16} className="text-muted-foreground" />
                              ) : (
                                <Cat size={16} className="text-muted-foreground" />
                              )}
                              <span>
                                {pet.name || `Pet ${index + 1}`} ({pet.weight}, {pet.age} year(s), {pet.sex})
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No pets added yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg">
                      <h4 className="font-medium text-orange-800 mb-4 flex items-center gap-2">
                        <DollarSign size={16} />
                        Cost Breakdown
                      </h4>

                      <CostBreakdown breakdown={calculateCost.breakdown} totalCost={calculateCost.totalCost} />
                    </div>

                    {/* Special notes about pricing */}
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>* Weekend and holiday surcharge: +20%</p>
                      <p>* Time surcharge: Before 8 AM or after 8 PM</p>
                      {(selectedService === "Spacer" || selectedService === "Wyzyta Domowa") && (
                        <p>* Distance surcharge: +1.5 zł per km beyond 5 km</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Special alerts */}
                {((selectedService === "Nocleg" &&
                  (isOutsideNormalHours(pickupTime) || isOutsideNormalHours(dropoffTime))) ||
                  ((selectedService === "Spacer" || selectedService === "Wyzyta Domowa") &&
                    datesWithTimes.some((d) => d.times.some((t) => t.isOutsideNormalHours)))) && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800">Time Surcharge Details</AlertTitle>
                    <AlertDescription className="text-amber-700">
                      If you selected a time outside our standard hours (8 AM - 8 PM), a surcharge of 10 zł per{" "}
                      {selectedService === "Nocleg" ? "pickup/dropoff" : "visit"} would be applied to the Total.
                    </AlertDescription>
                  </Alert>
                )}

                {distance !== null &&
                  distance > 5 &&
                  (selectedService === "Spacer" || selectedService === "Wyzyta Domowa") && (
                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertTitle className="text-amber-800">Distance Surcharge Applied</AlertTitle>
                      <AlertDescription className="text-amber-700">
                        Your location is {distance.toFixed(1)} km from our facility, which is{" "}
                        {(distance - 5).toFixed(1)} km beyond our standard 5 km radius. A surcharge of{" "}
                        {((distance - 5) * 1.5).toFixed(2)} zł per visit has been applied.
                      </AlertDescription>
                    </Alert>
                  )}

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("service")}>
                    Back to Service
                  </Button>
                  <Button type="submit" className="bg-[#C76E00] hover:bg-[#a85b00] text-white" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Saving Reservation...
                      </>
                    ) : (
                      "Complete Reservation"
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </form>
        </Tabs>
      </Card>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  )
}
