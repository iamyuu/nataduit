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
