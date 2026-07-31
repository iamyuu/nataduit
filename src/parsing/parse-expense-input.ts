import {
  CATEGORY_ALIASES,
  DEFAULT_CATEGORY,
  type Category,
} from "@/domain/category"
import { CURRENCIES } from "@/domain/currency"

// CATEGORY_ALIASES is keyed by Category, so every entry pairs an alias with a real Category.
const ALIAS_TO_CATEGORY = new Map<string, Category>(
  Object.entries(CATEGORY_ALIASES).flatMap(([category, aliases]) =>
    aliases.map((alias) => [alias, category as Category])
  )
)

export interface ParsedExpense {
  category: Category
  description: string
  amount: number
}

export type ParseError = "missing-amount" | "missing-description"

export type ParseResult =
  | { ok: true; value: ParsedExpense }
  | { ok: false; error: ParseError }

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

export function parseExpenseInput(raw: string): ParseResult {
  const tokens = raw.trim().split(/\s+/).filter(Boolean)

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
    value: { category: category ?? DEFAULT_CATEGORY, description, amount },
  }
}
