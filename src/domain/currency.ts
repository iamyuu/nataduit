export const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "JPY", symbol: "¥" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "IDR", symbol: "Rp" },
] as const

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
})

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount)
}
