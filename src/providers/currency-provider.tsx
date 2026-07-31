import * as React from "react"
import { CURRENCIES, type CurrencyCode } from "@/domain/currency"

const STORAGE_KEY = "currency"
const DEFAULT_CURRENCY: CurrencyCode = "USD"

interface CurrencyProviderState {
  currency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
}

const CurrencyProviderContext = React.createContext<
  CurrencyProviderState | undefined
>(undefined)

function isCurrencyCode(value: string | null): value is CurrencyCode {
  if (value === null) {
    return false
  }

  return CURRENCIES.some((currency) => currency.code === value)
}

export function CurrencyProvider(props: React.PropsWithChildren) {
  const [currency, setCurrencyState] = React.useState<CurrencyCode>(() => {
    const storedCurrency = localStorage.getItem(STORAGE_KEY)
    if (isCurrencyCode(storedCurrency)) {
      return storedCurrency
    }

    return DEFAULT_CURRENCY
  })

  const setCurrency = React.useCallback((nextCurrency: CurrencyCode) => {
    localStorage.setItem(STORAGE_KEY, nextCurrency)
    setCurrencyState(nextCurrency)
  }, [])

  const value = React.useMemo(
    () => ({ currency, setCurrency }),
    [currency, setCurrency]
  )

  return (
    <CurrencyProviderContext.Provider value={value}>
      {props.children}
    </CurrencyProviderContext.Provider>
  )
}

export function useCurrency() {
  const context = React.useContext(CurrencyProviderContext)

  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider")
  }

  return context
}
