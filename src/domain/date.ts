export function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function formatYearMonth(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`
}

export function todayKey(): string {
  return formatDateKey(new Date())
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number)
  return new Date(year, month - 1, day)
}

/** Returns 7 rows (Monday..Sunday), each spanning every week needed to cover the month. */
export function getCalendarWeekdayRows(year: number, month: number): Date[][] {
  const firstOfMonth = new Date(year, month, 1)
  const lastOfMonth = new Date(year, month + 1, 0)

  const firstWeekday = (firstOfMonth.getDay() + 6) % 7
  const lastWeekday = (lastOfMonth.getDay() + 6) % 7
  const totalDays = firstWeekday + lastOfMonth.getDate() + (6 - lastWeekday)

  const rows: Date[][] = Array.from({ length: 7 }, () => [])
  for (let i = 0; i < totalDays; i++) {
    const date = new Date(year, month, 1 - firstWeekday + i)
    rows[i % 7].push(date)
  }
  return rows
}
