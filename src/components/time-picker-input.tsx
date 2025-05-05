"use client"

import { Input } from "@/components/ui/input"
import { Clock } from "lucide-react"

interface TimePickerInputProps {
  id: string
  value: string
  onChange: (value: string) => void
}

export function TimePickerInput({ id, value, onChange }: TimePickerInputProps) {
  return (
    <div className="relative">
      <Input id={id} type="time" value={value} onChange={(e) => onChange(e.target.value)} className="pl-10" />
      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    </div>
  )
}
