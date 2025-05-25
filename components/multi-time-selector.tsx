"use client"
import { Button } from "@/components/ui/button"
import { TimePickerInput } from "@/components/time-picker-input"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Clock } from "lucide-react"
import { format } from "date-fns"

interface TimeSlot {
  id: string
  time: string
  isOutsideNormalHours: boolean
  duration: string // Add duration property
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
      duration: "30 minutes", // Default duration
    }
    onChange(date, [...times, newTimeSlot])
  }

  const updateTimeSlot = (id: string, field: string, value: string) => {
    const updatedTimes = times.map((slot) =>
      slot.id === id
        ? {
            ...slot,
            [field]: value,
            ...(field === "time" ? { isOutsideNormalHours: isOutsideNormalHours(value) } : {}),
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
            <div key={slot.id} className="space-y-2 p-2 border border-dashed rounded-md border-muted-foreground/20">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <TimePickerInput
                    id={`time-${slot.id}`}
                    value={slot.time}
                    onChange={(value) => updateTimeSlot(slot.id, "time", value)}
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

              <div className="flex items-center gap-2">
                <Clock size={14} className="text-muted-foreground" />
                <div className="flex-1">
                  <Select value={slot.duration} onValueChange={(value) => updateTimeSlot(slot.id, "duration", value)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30 minutes">30 minutes</SelectItem>
                      <SelectItem value="1 hour">1 hour</SelectItem>
                      <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                      <SelectItem value="2 hours">2 hours</SelectItem>
                      <SelectItem value="2.5 hours">2.5 hours</SelectItem>
                      <SelectItem value="3 hours">3 hours</SelectItem>
                      <SelectItem value="3.5 hours">3.5 hours</SelectItem>
                      <SelectItem value="4 hours">4 hours</SelectItem>
                      <SelectItem value="4.5 hours">4.5 hours</SelectItem>
                      <SelectItem value="5 hours">5 hours</SelectItem>
                      <SelectItem value="5.5 hours">5.5 hours</SelectItem>
                      <SelectItem value="6 hours">6 hours</SelectItem>
                      <SelectItem value="6.5 hours">6.5 hours</SelectItem>
                      <SelectItem value="7 hours">7 hours</SelectItem>
                      <SelectItem value="7.5 hours">7.5 hours</SelectItem>
                      <SelectItem value="8 hours">8 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
