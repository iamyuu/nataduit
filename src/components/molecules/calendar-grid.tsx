import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react"

import { formatCurrency } from "@/domain/currency"
import { formatDateKey, getCalendarWeekdayRows } from "@/domain/date"
import { cn } from "@/utils/misc"
import { Button } from "@/components/atoms/button"

const WEEKDAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

const BUCKET_BACKGROUND = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
]

function heatmapBucket(amount: number, min: number, max: number): number {
  if (min === max) return Math.ceil(BUCKET_BACKGROUND.length / 2)
  const ratio = (amount - min) / (max - min)
  return (
    Math.min(
      BUCKET_BACKGROUND.length - 1,
      Math.floor(ratio * BUCKET_BACKGROUND.length)
    ) + 1
  )
}

interface CalendarGridProps {
  year: number
  month: number
  todayKey: string
  dayTotals: Map<string, number>
  onPrevMonth: () => void
  onNextMonth: () => void
}

export function CalendarGrid({
  year,
  month,
  todayKey,
  dayTotals,
  onPrevMonth,
  onNextMonth,
}: CalendarGridProps) {
  const rows = getCalendarWeekdayRows(year, month)
  const monthLabel = new Date(year, month, 1)
    .toLocaleDateString(undefined, { month: "long" })
    .toUpperCase()

  const spendingDays = Array.from(dayTotals.values()).filter(
    (total) => total > 0
  )
  const min = spendingDays.length ? Math.min(...spendingDays) : 0
  const max = spendingDays.length ? Math.max(...spendingDays) : 0

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-1 py-3">
        <Button
          variant="ghost"
          size="icon"
          onPress={onPrevMonth}
          aria-label="Previous month"
        >
          <CaretLeftIcon />
        </Button>
        <h1 className="text-lg font-bold tracking-wide">{monthLabel}</h1>
        <Button
          variant="ghost"
          size="icon"
          onPress={onNextMonth}
          aria-label="Next month"
        >
          <CaretRightIcon />
        </Button>
      </div>
      <div className="flex flex-col gap-1">
        {rows.map((row, weekdayIndex) => (
          <div
            key={WEEKDAY_LABELS[weekdayIndex]}
            className="flex items-stretch gap-1"
          >
            <div className="flex w-4 items-center justify-center text-[10px] text-muted-foreground [writing-mode:vertical-rl]">
              {WEEKDAY_LABELS[weekdayIndex]}
            </div>
            <div className="flex flex-1 gap-1">
              {row.map((date) => {
                const dateKey = formatDateKey(date)
                return (
                  <DayCell
                    key={dateKey}
                    date={date}
                    isCurrentMonth={date.getMonth() === month}
                    isToday={dateKey === todayKey}
                    total={dayTotals.get(dateKey) ?? 0}
                    min={min}
                    max={max}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface DayCellProps {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  total: number
  min: number
  max: number
}

function DayCell({
  date,
  isCurrentMonth,
  isToday,
  total,
  min,
  max,
}: DayCellProps) {
  if (!isCurrentMonth) {
    return (
      <div className="aspect-square flex-1 rounded-md bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,var(--border)_4px,var(--border)_5px)]" />
    )
  }

  const hasSpend = total > 0
  const bucket = hasSpend ? heatmapBucket(total, min, max) : 0

  return (
    <div
      className={cn(
        "relative aspect-square flex-1 rounded-md border border-border",
        hasSpend && BUCKET_BACKGROUND[bucket - 1],
        isToday && "ring-1 ring-primary"
      )}
    >
      <span className="absolute top-1 left-1 text-[10px] text-muted-foreground">
        {date.getDate()}
      </span>
      {hasSpend ? (
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center text-sm font-medium",
            bucket >= 4 ? "text-white" : "text-foreground"
          )}
        >
          {formatCurrency(total)}
        </span>
      ) : isToday ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="size-1.5 rounded-full bg-primary" />
        </span>
      ) : null}
    </div>
  )
}
