import * as React from "react"

import { expenseRepository } from "@/db/expense-repository"
import { formatYearMonth, todayKey } from "@/domain/date"
import {
  parseExpenseInput,
  type ParseError,
} from "@/parsing/parse-expense-input"
import { CalendarGrid } from "@/components/molecules/calendar-grid"
import { DayDetailSheet } from "@/components/molecules/day-detail-sheet"
import { FloatingInput } from "@/components/molecules/floating-input"

export function App() {
  const [viewedMonth, setViewedMonth] = React.useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [dayTotals, setDayTotals] = React.useState<Map<string, number>>(
    new Map()
  )
  const [refreshToken, setRefreshToken] = React.useState(0)
  const [selectedDate, setSelectedDate] = React.useState<string>()

  const yearMonth = formatYearMonth(viewedMonth.year, viewedMonth.month)

  React.useEffect(() => {
    let cancelled = false
    expenseRepository.dayTotals(yearMonth).then((totals) => {
      if (!cancelled) setDayTotals(totals)
    })
    return () => {
      cancelled = true
    }
  }, [yearMonth, refreshToken])

  function bumpDayTotals() {
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
    bumpDayTotals()
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
      />
      {selectedDate === undefined && <FloatingInput onSubmit={handleSubmit} />}
      <DayDetailSheet
        dateKey={selectedDate}
        onClose={() => setSelectedDate(undefined)}
        onExpenseDeleted={bumpDayTotals}
      />
    </div>
  )
}

export default App
