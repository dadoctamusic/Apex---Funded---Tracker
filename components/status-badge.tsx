import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { FundedStatus } from "@/lib/types"

const STYLES: Record<FundedStatus, string> = {
  Funded: "bg-profit/15 text-profit",
  Passed: "bg-chart-2/15 text-chart-2",
  Evaluation: "bg-chart-3/15 text-chart-3",
  Failed: "bg-loss/15 text-loss",
}

export function StatusBadge({ status }: { status: FundedStatus }) {
  return (
    <Badge variant="secondary" className={cn("border-transparent", STYLES[status])}>
      {status}
    </Badge>
  )
}
