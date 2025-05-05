"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  isBefore,
  isWithinInterval,
  isWeekend,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CalendarProps {
  mode: "single" | "multiple" | "range"
  onDateSelect: (dates: Date[]) => void
  selectedDates?: Date[]
  blockedDates?: Date[]
  polishHolidays?: string[]
}

export function Calendar({
  mode = "single",
  onDateSelect,
  selectedDates = [],
  blockedDates = [],
  polishHolidays = [],
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [internalSelectedDates, setInternalSelectedDates] = useState<Date[]>(selectedDates)

  // Update internal state when prop changes
  useEffect(() => {
    setInternalSelectedDates(selectedDates)
  }, [selectedDates])

  const today = new Date()

  const prevMonth = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent any form submission
    e.stopPropagation() // Stop event propagation
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const nextMonth = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent any form submission
    e.stopPropagation() // Stop event propagation
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const isDateSelected = (date: Date) => {
    return internalSelectedDates.some((selectedDate) => isSameDay(date, selectedDate))
  }

  const isDateBlocked = (date: Date) => {
    return blockedDates.some((blockedDate) => isSameDay(date, blockedDate))
  }

  const isPastDate = (date: Date) => {
    const todayStart = new Date(today.setHours(0, 0, 0, 0))
    return isBefore(date, todayStart)
  }

  const isRangeStart = (date: Date) => {
    if (mode !== "range" || internalSelectedDates.length === 0) return false
    return isSameDay(date, internalSelectedDates[0])
  }

  const isRangeEnd = (date: Date) => {
    if (mode !== "range" || internalSelectedDates.length < 2) return false
    return isSameDay(date, internalSelectedDates[internalSelectedDates.length - 1])
  }

  const isInRange = (date: Date) => {
    if (mode !== "range" || internalSelectedDates.length < 2) return false

    const start = internalSelectedDates[0]
    const end = internalSelectedDates[internalSelectedDates.length - 1]

    return isWithinInterval(date, { start, end })
  }

  const isHoliday = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    return polishHolidays.includes(dateString)
  }

  const handleDateClick = (date: Date) => {
    if (isPastDate(date) || isDateBlocked(date)) return

    let newSelectedDates: Date[] = []

    if (mode === "single") {
      newSelectedDates = [date]
    } else if (mode === "multiple") {
      if (isDateSelected(date)) {
        newSelectedDates = internalSelectedDates.filter((d) => !isSameDay(d, date))
      } else {
        newSelectedDates = [...internalSelectedDates, date]
      }
    } else if (mode === "range") {
      if (internalSelectedDates.length === 0 || internalSelectedDates.length === 2) {
        newSelectedDates = [date]
      } else {
        // We have a start date, now set the end date
        const startDate = internalSelectedDates[0]

        // Ensure end date is after start date
        if (isBefore(date, startDate)) {
          newSelectedDates = [date, startDate]
        } else {
          newSelectedDates = [startDate, date]
        }
      }
    }

    setInternalSelectedDates(newSelectedDates)
    onDateSelect(newSelectedDates)
  }

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" size="icon" onClick={prevMonth} aria-label="Previous month">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-medium">{format(currentMonth, "MMMM yyyy")}</h2>
        <Button variant="ghost" size="icon" onClick={nextMonth} aria-label="Next month">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    )
  }

  const renderDaysOfWeek = () => {
    const startDate = startOfWeek(currentMonth, { weekStartsOn: 1 })
    const days = []

    for (let i = 0; i < 7; i++) {
      const day = addDays(startDate, i)
      days.push(
        <div key={i} className="text-center font-medium text-sm text-muted-foreground">
          {format(day, "EEE")}
        </div>,
      )
    }

    return <div className="grid grid-cols-7 gap-1 mb-2">{days}</div>
  }

  const renderDaysOfMonth = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const rows = []
    let days = []
    let currentDate = startDate

    while (currentDate <= endDate) {
      for (let i = 0; i < 7; i++) {
        const day = currentDate
        const isCurrentMonth = isSameMonth(day, currentMonth)
        const isToday = isSameDay(day, today)
        const isSelected = isDateSelected(day)
        const isBlocked = isDateBlocked(day)
        const isPast = isPastDate(day)
        const isSelectable = isCurrentMonth && !isBlocked && !isPast
        const isStart = isRangeStart(day)
        const isEnd = isRangeEnd(day)
        const isWithinRange = isInRange(day)
        const isWeekendDay = isWeekend(day)
        const isHolidayDay = isHoliday(day)
        const isSpecialDay = isWeekendDay || isHolidayDay

        days.push(
          <button
            key={day.toISOString()}
            type="button"
            disabled={!isSelectable}
            onClick={() => handleDateClick(day)}
            className={`
              h-10 w-10 rounded-full flex items-center justify-center text-sm
              ${!isCurrentMonth ? "text-muted-foreground opacity-50" : ""}
              ${isToday && !isSelected ? "border border-primary" : ""}
              ${isSelected ? "bg-primary text-primary-foreground" : ""}
              ${isStart ? "rounded-l-full" : ""}
              ${isEnd ? "rounded-r-full" : ""}
              ${isWithinRange && !isSelected ? "bg-primary/10" : ""}
              ${isSpecialDay && isCurrentMonth && !isSelected ? "bg-amber-100 hover:bg-amber-200" : ""}
              ${isSelectable ? "hover:bg-primary/10 cursor-pointer" : "cursor-not-allowed opacity-50"}
            `}
          >
            {format(day, "d")}
          </button>,
        )

        currentDate = addDays(currentDate, 1)
      }

      rows.push(
        <div key={currentDate.toISOString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>,
      )

      days = []
    }

    return <div className="space-y-1">{rows}</div>
  }

  return (
    <div className="p-4 border rounded-lg bg-card">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderDaysOfMonth()}
    </div>
  )
}
