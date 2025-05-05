"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Trash2, Dog, Cat } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const WEIGHT_RANGES = ["<5 kg", "6-15 kg", "16-25 kg", "26-35 kg", "36 kg +"]
const SEX_OPTIONS = ["Male", "Female"]
const AGE_OPTIONS = Array.from({ length: 20 }, (_, i) => `${i + 1}`)

interface PetProfileProps {
  pet: {
    id: string
    type: string
    weight: string
    name: string
    sex: string
    age: string
  }
  onUpdate: (field: string, value: string) => void
  onRemove: () => void
}

export function PetProfile({ pet, onUpdate, onRemove }: PetProfileProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-orange-100 to-amber-50 p-4 flex justify-between items-start">
          <div className="space-y-1">
            <h4 className="font-medium flex items-center gap-2">
              {pet.type === "dog" ? (
                <Dog size={18} className="text-orange-600" />
              ) : (
                <Cat size={18} className="text-orange-600" />
              )}
              {pet.name || "New Pet"}
              <Badge variant="outline" className="ml-2 bg-white/80 text-orange-700 border-orange-200">
                {pet.weight}
              </Badge>
            </h4>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="text-orange-700 hover:text-orange-900 hover:bg-orange-100"
          >
            <Trash2 size={18} />
            <span className="sr-only">Remove pet</span>
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Pet Type Selection */}
          <div className="space-y-2">
            <Label>Pet Type</Label>
            <RadioGroup value={pet.type} onValueChange={(value) => onUpdate("type", value)} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dog" id={`${pet.id}-dog`} />
                <Label htmlFor={`${pet.id}-dog`} className="flex items-center gap-1">
                  <Dog size={16} />
                  Dog
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cat" id={`${pet.id}-cat`} />
                <Label htmlFor={`${pet.id}-cat`} className="flex items-center gap-1">
                  <Cat size={16} />
                  Cat
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Weight Range */}
          <div className="space-y-2">
            <Label htmlFor={`${pet.id}-weight`}>Weight Range</Label>
            <Select value={pet.weight} onValueChange={(value) => onUpdate("weight", value)}>
              <SelectTrigger id={`${pet.id}-weight`}>
                <SelectValue placeholder="Select weight range" />
              </SelectTrigger>
              <SelectContent>
                {WEIGHT_RANGES.map((weight) => (
                  <SelectItem key={weight} value={weight}>
                    {weight}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pet Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${pet.id}-name`}>Pet's Name</Label>
              <Input
                id={`${pet.id}-name`}
                value={pet.name}
                onChange={(e) => onUpdate("name", e.target.value)}
                placeholder="Enter name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${pet.id}-sex`}>Sex</Label>
              <Select value={pet.sex} onValueChange={(value) => onUpdate("sex", value)}>
                <SelectTrigger id={`${pet.id}-sex`}>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  {SEX_OPTIONS.map((sex) => (
                    <SelectItem key={sex} value={sex}>
                      {sex}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${pet.id}-age`}>Age (years)</Label>
              <Select value={pet.age} onValueChange={(value) => onUpdate("age", value)}>
                <SelectTrigger id={`${pet.id}-age`}>
                  <SelectValue placeholder="Select age" />
                </SelectTrigger>
                <SelectContent>
                  {AGE_OPTIONS.map((age) => (
                    <SelectItem key={age} value={age}>
                      {age}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
