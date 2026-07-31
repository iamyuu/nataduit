export const CURRENCIES = [
  { code: "USD", symbol: "$", locale: "en-US" },
  { code: "JPY", symbol: "¥", locale: "ja-JP" },
  { code: "EUR", symbol: "€", locale: "de-DE" },
  { code: "GBP", symbol: "£", locale: "en-GB" },
  { code: "IDR", symbol: "Rp", locale: "id-ID" },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]["code"]

const LOCALE_BY_CURRENCY: Record<CurrencyCode, string> = Object.fromEntries(
  CURRENCIES.map((currency) => [currency.code, currency.locale])
) as Record<CurrencyCode, string>

const SYMBOL_BY_CURRENCY: Record<CurrencyCode, string> = Object.fromEntries(
  CURRENCIES.map((currency) => [currency.code, currency.symbol])
) as Record<CurrencyCode, string>

const formatters = new Map<CurrencyCode, Intl.NumberFormat>()

export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode
): string {
  let formatter = formatters.get(currencyCode)
  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALE_BY_CURRENCY[currencyCode], {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "narrowSymbol",
    })
    formatters.set(currencyCode, formatter)
  }
  return formatter.format(amount)
}

function formatCompactNumber(
  amount: number,
  divisor: number,
  suffix: string
): string {
  return (amount / divisor).toFixed(1).replace(/\.0$/, "") + suffix
}

export function formatCompactCurrency(
  amount: number,
  currencyCode: CurrencyCode
): string {
  const symbol = SYMBOL_BY_CURRENCY[currencyCode]

  if (amount < 1_000) {
    return symbol + String(Math.round(amount))
  }

  if (amount < 1_000_000) {
    const compact = formatCompactNumber(amount, 1_000, "k")
    if (!compact.startsWith("1000")) {
      return symbol + compact
    }
  }

  return symbol + formatCompactNumber(amount, 1_000_000, "M")
}
