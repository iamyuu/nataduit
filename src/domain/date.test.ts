import { describe, expect, it } from "vitest"
import { formatDateKey, getCalendarWeekdayRows } from "@/domain/date"

function keys(dates: Date[]): string[] {
  return dates.map(formatDateKey)
}

describe("formatDateKey", () => {
  it("formats a date as YYYY-MM-DD, zero-padded", () => {
    expect(formatDateKey(new Date(2026, 0, 5))).toBe("2026-01-05")
  })
})

describe("getCalendarWeekdayRows", () => {
  it("returns exactly 4 padding-free weeks for a month that starts on Monday and ends on Sunday", () => {
    // February 2027: 1st is a Monday, 28th is a Sunday (independently verified).
    const rows = getCalendarWeekdayRows(2027, 1)

    expect(rows).toHaveLength(7)
    for (const row of rows) {
      expect(row).toHaveLength(4)
    }
    expect(keys(rows[0])).toEqual([
      "2027-02-01",
      "2027-02-08",
      "2027-02-15",
      "2027-02-22",
    ])
    expect(keys(rows[6])).toEqual([
      "2027-02-07",
      "2027-02-14",
      "2027-02-21",
      "2027-02-28",
    ])
  })

  it("pads the front and back with adjacent-month days to complete 5 weeks", () => {
    // July 2026: 1st is a Wednesday, 31st is a Friday (independently verified).
    const rows = getCalendarWeekdayRows(2026, 6)

    for (const row of rows) {
      expect(row).toHaveLength(5)
    }
    expect(keys(rows[0])[0]).toBe("2026-06-29")
    expect(keys(rows[6]).at(-1)).toBe("2026-08-02")
  })

  it("extends to 6 weeks when the month needs it", () => {
    // November 2026: 1st is a Sunday, 30th is a Monday (independently verified).
    const rows = getCalendarWeekdayRows(2026, 10)

    for (const row of rows) {
      expect(row).toHaveLength(6)
    }
    expect(keys(rows[0])[0]).toBe("2026-10-26")
    expect(keys(rows[6]).at(-1)).toBe("2026-12-06")
  })
})
