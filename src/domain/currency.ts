export const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "JPY", symbol: "¥" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "IDR", symbol: "Rp" },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]["code"]

const formatters = new Map<CurrencyCode, Intl.NumberFormat>()

export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode
): string {
  let formatter = formatters.get(currencyCode)
  if (!formatter) {
    formatter = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "narrowSymbol",
    })
    formatters.set(currencyCode, formatter)
  }
  return formatter.format(amount)
}
