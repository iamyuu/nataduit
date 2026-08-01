import { describe, expect, it } from "vitest"
import { parseExpenseInput } from "@/utils/parse-expense-input"

describe("parseExpenseInput", () => {
  it("defaults to wants and applies the k suffix when no category is given", () => {
    expect(parseExpenseInput("burger 23k")).toEqual({
      ok: true,
      value: { category: "wants", description: "burger", amount: 23000 },
    })
  })

  it("matches a leading category alias and keeps the rest as a multi-word description", () => {
    expect(parseExpenseInput("need electricty 100k")).toEqual({
      ok: true,
      value: { category: "needs", description: "electricty", amount: 100000 },
    })
    expect(parseExpenseInput("unexpected tire repairs 5k")).toEqual({
      ok: true,
      value: {
        category: "unexpected",
        description: "tire repairs",
        amount: 5000,
      },
    })
  })

  it("strips a leading currency symbol from the amount", () => {
    expect(parseExpenseInput("culture svg course $149")).toEqual({
      ok: true,
      value: { category: "culture", description: "svg course", amount: 149 },
    })
    expect(parseExpenseInput("culture atomic book ¥35")).toEqual({
      ok: true,
      value: { category: "culture", description: "atomic book", amount: 35 },
    })
    expect(parseExpenseInput("wants tea £4")).toEqual({
      ok: true,
      value: { category: "wants", description: "tea", amount: 4 },
    })
    expect(parseExpenseInput("wants noodles Rp15000")).toEqual({
      ok: true,
      value: { category: "wants", description: "noodles", amount: 15000 },
    })
  })

  it("accepts a currency symbol combined with a decimal and the k suffix", () => {
    expect(parseExpenseInput("wants coffee $23.5k")).toEqual({
      ok: true,
      value: { category: "wants", description: "coffee", amount: 23500 },
    })
  })

  it("matches a category alias case-insensitively", () => {
    expect(parseExpenseInput("NEED electricty 100k")).toEqual({
      ok: true,
      value: { category: "needs", description: "electricty", amount: 100000 },
    })
  })

  it("accepts decimal amounts with and without the k suffix", () => {
    expect(parseExpenseInput("wants coffee 23.5k")).toEqual({
      ok: true,
      value: { category: "wants", description: "coffee", amount: 23500 },
    })
    expect(parseExpenseInput("wants coffee 149.99")).toEqual({
      ok: true,
      value: { category: "wants", description: "coffee", amount: 149.99 },
    })
  })

  it("accepts a currency symbol combined with the k suffix", () => {
    expect(parseExpenseInput("wants coffee $23k")).toEqual({
      ok: true,
      value: { category: "wants", description: "coffee", amount: 23000 },
    })
  })

  it("rejects input with no valid amount as the last token", () => {
    expect(parseExpenseInput("burger")).toEqual({
      ok: false,
      error: "missing-amount",
    })
    expect(parseExpenseInput("burger for lunch")).toEqual({
      ok: false,
      error: "missing-amount",
    })
    expect(parseExpenseInput("")).toEqual({
      ok: false,
      error: "missing-amount",
    })
    expect(parseExpenseInput("   ")).toEqual({
      ok: false,
      error: "missing-amount",
    })
  })

  it("rejects input with nothing left for the description", () => {
    expect(parseExpenseInput("50k")).toEqual({
      ok: false,
      error: "missing-description",
    })
    expect(parseExpenseInput("needs 100k")).toEqual({
      ok: false,
      error: "missing-description",
    })
  })

  it("tolerates irregular whitespace between tokens", () => {
    expect(parseExpenseInput("  unexpected   tire  repairs   5k  ")).toEqual({
      ok: true,
      value: {
        category: "unexpected",
        description: "tire repairs",
        amount: 5000,
      },
    })
  })
})

describe("parseExpenseInput backdating (at {{date}} clause)", () => {
  // Fixed reference "today": August 15, 2026.
  const today = new Date(2026, 7, 15)

  it("resolves a day-month date with no year to this year, when that day already passed", () => {
    expect(parseExpenseInput("burger 23k at 2 may", { today })).toEqual({
      ok: true,
      value: {
        category: "wants",
        description: "burger",
        amount: 23000,
        date: "2026-05-02",
      },
    })
  })

  it("resolves a day-month date with no year to last year, when that day hasn't happened yet this year", () => {
    expect(parseExpenseInput("burger 23k at 31 dec", { today })).toEqual({
      ok: true,
      value: {
        category: "wants",
        description: "burger",
        amount: 23000,
        date: "2025-12-31",
      },
    })
  })

  it("treats the reference day itself as already past (not future)", () => {
    expect(parseExpenseInput("burger 23k at 15 aug", { today })).toEqual({
      ok: true,
      value: {
        category: "wants",
        description: "burger",
        amount: 23000,
        date: "2026-08-15",
      },
    })
  })

  it("uses an explicit 4-digit year as given", () => {
    expect(parseExpenseInput("burger 23k at 31 dec 2025", { today })).toEqual({
      ok: true,
      value: {
        category: "wants",
        description: "burger",
        amount: 23000,
        date: "2025-12-31",
      },
    })
  })

  it("accepts full month names, not just abbreviations", () => {
    expect(parseExpenseInput("burger 23k at 2 august", { today })).toEqual({
      ok: true,
      value: {
        category: "wants",
        description: "burger",
        amount: 23000,
        date: "2026-08-02",
      },
    })
  })

  it("is case-insensitive for the at keyword and the month name", () => {
    expect(parseExpenseInput("burger 23k AT 2 MAY", { today })).toEqual({
      ok: true,
      value: {
        category: "wants",
        description: "burger",
        amount: 23000,
        date: "2026-05-02",
      },
    })
  })

  it("reads month-day order when configured, instead of the default day-month", () => {
    expect(
      parseExpenseInput("burger 23k at may 2", {
        today,
        dateOrder: "month-day",
      })
    ).toEqual({
      ok: true,
      value: {
        category: "wants",
        description: "burger",
        amount: 23000,
        date: "2026-05-02",
      },
    })
  })

  it("keeps a leading category alias alongside a trailing date clause", () => {
    expect(
      parseExpenseInput("need groceries 100k at 2 may", { today })
    ).toEqual({
      ok: true,
      value: {
        category: "needs",
        description: "groceries",
        amount: 100000,
        date: "2026-05-02",
      },
    })
  })

  it("rejects an explicit future date outright", () => {
    expect(parseExpenseInput("burger 23k at 31 dec 2027", { today })).toEqual({
      ok: false,
      error: "future-date",
    })
  })

  it("silently falls back to today for an unrecognized month name", () => {
    expect(parseExpenseInput("burger 23k at 2 mayy", { today })).toEqual({
      ok: true,
      value: { category: "wants", description: "burger", amount: 23000 },
    })
  })

  it("silently falls back to today for a day that doesn't exist in that month", () => {
    expect(parseExpenseInput("burger 23k at 31 feb", { today })).toEqual({
      ok: true,
      value: { category: "wants", description: "burger", amount: 23000 },
    })
  })

  it("silently falls back to today for a day out of the 1-31 range", () => {
    expect(parseExpenseInput("burger 23k at 32 jan", { today })).toEqual({
      ok: true,
      value: { category: "wants", description: "burger", amount: 23000 },
    })
  })

  it("treats 'at' in the middle of a description as ordinary text, not a date clause", () => {
    expect(parseExpenseInput("dinner at restaurant 23k", { today })).toEqual({
      ok: true,
      value: {
        category: "wants",
        description: "dinner at restaurant",
        amount: 23000,
      },
    })
  })

  it("has no date field when no at clause is given, preserving existing behavior", () => {
    const result = parseExpenseInput("burger 23k", { today })
    expect(result.ok).toBe(true)
    expect(result.ok && "date" in result.value).toBe(false)
  })
})
