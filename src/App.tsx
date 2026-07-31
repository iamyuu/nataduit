import * as React from "react"

import { expenseRepository } from "@/db/expense-repository"
import { zeroCategoryTotals, type Category } from "@/domain/category"
import { formatYearMonth, todayKey } from "@/domain/date"
import {
  parseExpenseInput,
  type ParseError,
} from "@/parsing/parse-expense-input"
import { CalendarGrid } from "@/components/molecules/calendar-grid"
import { CurrencySettingsSheet } from "@/components/molecules/currency-settings-sheet"
import { DayDetailSheet } from "@/components/molecules/day-detail-sheet"
import { FloatingInput } from "@/components/molecules/floating-input"
import { PillarSummary } from "@/components/molecules/pillar-summary"

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

  function bumpTotals() {
    setRefreshToken((token) => token + 1)
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

  async function handleSubmit(raw: string): Promise<ParseError | undefined> {
    const result = parseExpenseInput(raw)
    if (!result.ok) return result.error

    await expenseRepository.add({ date: todayKey(), ...result.value })
    bumpTotals()
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
        onSelectDay={setSelectedDate}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      <PillarSummary totals={pillarTotals} />
      {selectedDate === undefined && <FloatingInput onSubmit={handleSubmit} />}
      <DayDetailSheet
        dateKey={selectedDate}
        onClose={() => setSelectedDate(undefined)}
        onExpenseDeleted={bumpTotals}
      />
      <CurrencySettingsSheet
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}

export default App
