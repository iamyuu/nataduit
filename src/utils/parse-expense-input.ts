import {
  CATEGORY_ALIASES,
  DEFAULT_CATEGORY,
  type Category,
} from "@/domain/category"
import { CURRENCIES } from "@/domain/currency"
import { DEFAULT_DATE_ORDER, type DateOrder } from "@/domain/date-order"
import { formatDateKey } from "@/domain/date"

// CATEGORY_ALIASES is keyed by Category, so every entry pairs an alias with a real Category.
const ALIAS_TO_CATEGORY = new Map<string, Category>(
  Object.entries(CATEGORY_ALIASES).flatMap(([category, aliases]) =>
    aliases.map((alias) => [alias, category as Category])
  )
)

const MONTH_NAMES: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
}

export interface ParsedExpense {
  category: Category
  description: string
  amount: number
  /** YYYY-MM-DD; present only when a valid `at {{date}}` clause was given. */
  date?: string
}

export type ParseError =
  | "missing-amount"
  | "missing-description"
  | "future-date"

export type ParseResult =
  | { ok: true; value: ParsedExpense }
  | { ok: false; error: ParseError }

export interface ParseOptions {
  dateOrder?: DateOrder
  /** Reference "now", for testability. Defaults to the real current time. */
  today?: Date
}

const CURRENCY_SYMBOL_PATTERN = CURRENCIES.map((currency) =>
  currency.symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
).join("|")

const AMOUNT_PATTERN = new RegExp(
  `^(?:${CURRENCY_SYMBOL_PATTERN})?(\\d+(?:\\.\\d+)?)([kK])?$`
)

function parseAmount(token: string): number | undefined {
  const match = AMOUNT_PATTERN.exec(token)
  if (!match) return undefined
  const [, digits, suffix] = match
  const value = Number(digits)
  return suffix ? value * 1000 : value
}

function isValidCalendarDate(
  year: number,
  month: number,
  day: number
): Date | undefined {
  const date = new Date(year, month, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return undefined
  }
  return date
}

function resolveNearestPastOccurrence(
  month: number,
  day: number,
  todayMidnight: Date
): Date | undefined {
  const thisYear = isValidCalendarDate(todayMidnight.getFullYear(), month, day)
  if (thisYear && thisYear.getTime() <= todayMidnight.getTime()) {
    return thisYear
  }
  return isValidCalendarDate(todayMidnight.getFullYear() - 1, month, day)
}

function parseDayAndMonthTokens(
  first: string,
  second: string,
  dateOrder: DateOrder
): { day: number; month: number } | undefined {
  const [dayToken, monthToken] =
    dateOrder === "day-month" ? [first, second] : [second, first]

  if (!/^\d{1,2}$/.test(dayToken)) return undefined
  const day = Number(dayToken)
  if (day < 1 || day > 31) return undefined

  const month = MONTH_NAMES[monthToken.toLowerCase()]
  if (month === undefined) return undefined

  return { day, month }
}

/**
 * A cheap pre-check, distinct from full validation: does this pair even look
 * like a date attempt (a 1-2 digit number and a word), regardless of whether
 * the day is in range or the month name is real? Only shapes that pass this
 * get treated as a malformed date clause (strip + fall back to today) rather
 * than ordinary text — e.g. "restaurant 23k" after a mid-sentence "at" isn't
 * shaped like a date at all, so it's left alone.
 */
function looksLikeDateClauseShape(
  first: string,
  second: string,
  dateOrder: DateOrder
): boolean {
  const [dayToken, monthToken] =
    dateOrder === "day-month" ? [first, second] : [second, first]
  return /^\d{1,2}$/.test(dayToken) && /^[a-z]+$/i.test(monthToken)
}

interface DateClauseResult {
  tokens: string[]
  date?: string
  isFuture: boolean
}

/**
 * Recognizes a trailing "at {{date}}" clause anchored to the end of the token
 * list, so "at" appearing mid-description (e.g. "dinner at restaurant") is
 * never mistaken for one — only an "at" immediately followed by a plausible
 * day/month(/year) shape all the way to the end counts.
 */
function extractDateClause(
  tokens: string[],
  dateOrder: DateOrder,
  today: Date
): DateClauseResult {
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )

  if (
    tokens.length >= 4 &&
    (tokens[tokens.length - 4] ?? "").toLowerCase() === "at"
  ) {
    const [, first, second, yearToken] = tokens.slice(-4)
    if (
      looksLikeDateClauseShape(first!, second!, dateOrder) &&
      /^\d+$/.test(yearToken!)
    ) {
      const remaining = tokens.slice(0, -4)
      const parsed = parseDayAndMonthTokens(first!, second!, dateOrder)
      if (parsed && /^\d{4}$/.test(yearToken!)) {
        const date = isValidCalendarDate(
          Number(yearToken),
          parsed.month,
          parsed.day
        )
        if (date) {
          const isFuture = date.getTime() > todayMidnight.getTime()
          return {
            tokens: remaining,
            date: isFuture ? undefined : formatDateKey(date),
            isFuture,
          }
        }
      }
      return { tokens: remaining, date: undefined, isFuture: false }
    }
  }

  if (
    tokens.length >= 3 &&
    (tokens[tokens.length - 3] ?? "").toLowerCase() === "at"
  ) {
    const [, first, second] = tokens.slice(-3)
    if (looksLikeDateClauseShape(first!, second!, dateOrder)) {
      const remaining = tokens.slice(0, -3)
      const parsed = parseDayAndMonthTokens(first!, second!, dateOrder)
      if (parsed) {
        const date = resolveNearestPastOccurrence(
          parsed.month,
          parsed.day,
          todayMidnight
        )
        if (date) {
          return {
            tokens: remaining,
            date: formatDateKey(date),
            isFuture: false,
          }
        }
      }
      return { tokens: remaining, date: undefined, isFuture: false }
    }
  }

  return { tokens, date: undefined, isFuture: false }
}

export function parseExpenseInput(
  raw: string,
  options: ParseOptions = {}
): ParseResult {
  const dateOrder = options.dateOrder ?? DEFAULT_DATE_ORDER
  const today = options.today ?? new Date()

  const rawTokens = raw.trim().split(/\s+/).filter(Boolean)
  const { tokens, date, isFuture } = extractDateClause(
    rawTokens,
    dateOrder,
    today
  )

  if (isFuture) {
    return { ok: false, error: "future-date" }
  }

  const amount = parseAmount(tokens[tokens.length - 1] ?? "")
  if (amount === undefined) {
    return { ok: false, error: "missing-amount" }
  }

  const rest = tokens.slice(0, -1)
  const category = ALIAS_TO_CATEGORY.get((rest[0] ?? "").toLowerCase())
  const descriptionTokens = category ? rest.slice(1) : rest

  const description = descriptionTokens.join(" ")
  if (description === "") {
    return { ok: false, error: "missing-description" }
  }

  return {
    ok: true,
    value: {
      category: category ?? DEFAULT_CATEGORY,
      description,
      amount,
      ...(date !== undefined && { date }),
    },
  }
}
