import { CATEGORIES, type Category } from "@/domain/category"
import { formatCurrency } from "@/domain/currency"
import { useCurrency } from "@/providers/currency-provider"
import { cn } from "@/utils/misc"

const PILLAR_LABELS: Record<Category, string> = {
  needs: "Needs",
  wants: "Wants",
  culture: "Culture",
  unexpected: "Unexpected",
}

const PILLAR_ACCENT: Record<Category, string> = {
  needs: "bg-pillar-needs",
  wants: "bg-pillar-wants",
  culture: "bg-pillar-culture",
  unexpected: "bg-pillar-unexpected",
}

interface PillarSummaryProps {
  totals: Record<Category, number>
}

export function PillarSummary({ totals }: PillarSummaryProps) {
  const { currency } = useCurrency()

  return (
    <div className="grid grid-cols-2 gap-2 py-4">
      {CATEGORIES.map((category) => (
        <div
          key={category}
          className="flex flex-col rounded-md border border-border p-3"
        >
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className={cn("size-1.5 rounded-full", PILLAR_ACCENT[category])}
            />
            {PILLAR_LABELS[category]}
          </span>
          <span className="text-sm font-medium">
            {formatCurrency(totals[category], currency)}
          </span>
        </div>
      ))}
    </div>
  )
}
