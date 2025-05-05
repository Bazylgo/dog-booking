import { Separator } from "@/components/ui/separator"

interface CostItem {
  description: string
  amount: number
}

interface CostBreakdownProps {
  breakdown: CostItem[]
  totalCost: number
}

export function CostBreakdown({ breakdown, totalCost }: CostBreakdownProps) {
  if (breakdown.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Please complete your reservation details to see the cost breakdown.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {breakdown.map((item, index) => (
        <div key={index} className="flex justify-between text-sm">
          <span>{item.description}</span>
          <span className="font-medium">{item.amount.toFixed(2)} zł</span>
        </div>
      ))}

      <Separator className="my-2 bg-orange-200" />

      <div className="flex justify-between font-bold text-orange-900">
        <span>Total</span>
        <span>{totalCost.toFixed(2)} zł</span>
      </div>
    </div>
  )
}
