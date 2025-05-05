"use client"
import { Button } from "@/components/ui/button"
import { TimePickerInput } from "@/components/time-picker-input"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"

interface TimeSlot {
  id: string
  time: string
  isOutsideNormalHours: boolean
}

interface MultiTimeSelectorProps {
  date: Date
  times: TimeSlot[]
  onChange: (date: Date, times: TimeSlot[]) => void
  isOutsideNormalHours: (time: string) => boolean
  surchargeAmount: number
}

export function MultiTimeSelector({
  date,
  times,
  onChange,
  isOutsideNormalHours,
  surchargeAmount,
}: MultiTimeSelectorProps) {
  const addTimeSlot = () => {
    const newTime = "12:00"
    const newTimeSlot = {
      id: Date.now().toString(),
      time: newTime,
      isOutsideNormalHours: isOutsideNormalHours(newTime),
    }
    onChange(date, [...times, newTimeSlot])
  }

  const updateTimeSlot = (id: string, newTime: string) => {
    const updatedTimes = times.map((slot) =>
      slot.id === id
        ? {
            ...slot,
            time: newTime,
            isOutsideNormalHours: isOutsideNormalHours(newTime),
          }
        : slot,
    )
    onChange(date, updatedTimes)
  }

  const removeTimeSlot = (id: string) => {
    const updatedTimes = times.filter((slot) => slot.id !== id)
    onChange(date, updatedTimes)
  }

  return (
    <div className="space-y-3 p-3 border rounded-md bg-muted/30">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{format(date, "EEEE, MMMM d, yyyy")}</h4>
        <Button type="button" variant="outline" size="sm" onClick={addTimeSlot} className="h-7 px-2">
          <Plus size={14} className="mr-1" /> Add Time
        </Button>
      </div>

      {times.length === 0 ? (
        <div className="text-center py-2 text-sm text-muted-foreground">
          No times added. Click "Add Time" to schedule a service.
        </div>
      ) : (
        <div className="space-y-2">
          {times.map((slot) => (
            <div key={slot.id} className="flex items-center gap-2">
              <div className="flex-1">
                <TimePickerInput
                  id={`time-${slot.id}`}
                  value={slot.time}
                  onChange={(value) => updateTimeSlot(slot.id, value)}
                />
              </div>

              {slot.isOutsideNormalHours && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        +{surchargeAmount} zł
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Surcharge for times before 8 AM or after 8 PM</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeTimeSlot(slot.id)}
                className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              >
                <Trash2 size={14} />
                <span className="sr-only">Remove time</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
