import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/calculations"

export function PnlValue({
  value,
  className,
  showPlus = true,
}: {
  value: number
  className?: string
  showPlus?: boolean
}) {
  const positive = value > 0
  const negative = value < 0
  const formatted = formatCurrency(value)
  const display = positive && showPlus ? `+${formatted}` : formatted
  return (
    <span
      className={cn(
        "font-mono tabular-nums",
        positive && "text-profit",
        negative && "text-loss",
        !positive && !negative && "text-muted-foreground",
        className,
      )}
    >
      {display}
    </span>
  )
}
