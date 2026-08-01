import * as React from "react"

import { expenseRepository } from "@/db/expense-repository"
import { zeroCategoryTotals, type Category } from "@/domain/category"
import { formatYearMonth, parseDateKey, todayKey } from "@/domain/date"
import { parseExpenseInput, type ParseError } from "@/utils/parse-expense-input"
import { useDateOrder } from "@/providers/date-order-provider"
import { CalendarGrid } from "@/components/molecules/calendar-grid"
import { DayDetailSheet } from "@/components/molecules/day-detail-sheet"
import { FloatingInput } from "@/components/molecules/floating-input"
import { PillarSummary } from "@/components/molecules/pillar-summary"
import { PwaNotifications } from "@/components/molecules/pwa-notifications"
import { SettingsSheet } from "@/components/molecules/settings-sheet"

export function App() {
  const [viewedMonth, setViewedMonth] = React.useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [dayTotals, setDayTotals] = React.useState<Map<string, number>>(
    new Map()
  )
  const [pillarTotals, setPillarTotals] =
    React.useState<Record<Category, number>>(zeroCategoryTotals)
  const [refreshToken, setRefreshToken] = React.useState(0)
  const [selectedDate, setSelectedDate] = React.useState<string>()
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const { dateOrder } = useDateOrder()

  const yearMonth = formatYearMonth(viewedMonth.year, viewedMonth.month)

  React.useEffect(() => {
    let cancelled = false
    Promise.all([
      expenseRepository.dayTotals(yearMonth),
      expenseRepository.pillarTotals(yearMonth),
    ]).then(([days, pillars]) => {
      if (!cancelled) {
        setDayTotals(days)
        setPillarTotals(pillars)
      }
    })
    return () => {
      cancelled = true
    }
  }, [yearMonth, refreshToken])

  function bumpTotals(entryDate?: string) {
    setRefreshToken((token) => token + 1)

    if (entryDate) {
      const parsedEntryDate = parseDateKey(entryDate)
      setViewedMonth({
        year: parsedEntryDate.getFullYear(),
        month: parsedEntryDate.getMonth(),
      })
    }
  }

  function goToPreviousMonth() {
    setViewedMonth(({ year, month }) => {
      const date = new Date(year, month - 1, 1)
      return { year: date.getFullYear(), month: date.getMonth() }
    })
  }

  function goToNextMonth() {
    setViewedMonth(({ year, month }) => {
      const date = new Date(year, month + 1, 1)
      return { year: date.getFullYear(), month: date.getMonth() }
    })
  }

  function goToCurrentMonth() {
    const now = new Date()
    setViewedMonth({ year: now.getFullYear(), month: now.getMonth() })
  }

  async function handleSubmit(raw: string): Promise<ParseError | undefined> {
    const result = parseExpenseInput(raw, { dateOrder })
    if (!result.ok) return result.error

    const date = result.value.date ?? todayKey()
    await expenseRepository.add({ date, ...result.value })
    bumpTotals(result.value.date)

    return undefined
  }

  return (
    <div className="mx-auto min-h-svh w-full max-w-md px-4 pt-4 pb-24">
      <CalendarGrid
        year={viewedMonth.year}
        month={viewedMonth.month}
        todayKey={todayKey()}
        dayTotals={dayTotals}
        onPrevMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onJumpToday={goToCurrentMonth}
        onSelectDay={setSelectedDate}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      <PillarSummary totals={pillarTotals} />
      {selectedDate === undefined && <FloatingInput onSubmit={handleSubmit} />}
      <DayDetailSheet
        dateKey={selectedDate}
        onClose={() => setSelectedDate(undefined)}
        onExpensesChanged={bumpTotals}
      />
      <SettingsSheet
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <PwaNotifications />
    </div>
  )
}

export default App
