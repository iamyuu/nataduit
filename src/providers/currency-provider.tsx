import * as React from "react"
import { currencyCodeSchema, type CurrencyCode } from "@/domain/currency"

const STORAGE_KEY = "currency"
const DEFAULT_CURRENCY: CurrencyCode = "USD"

interface CurrencyProviderState {
  currency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
}

const CurrencyProviderContext = React.createContext<
  CurrencyProviderState | undefined
>(undefined)

export function CurrencyProvider(props: React.PropsWithChildren) {
  const [currency, setCurrencyState] = React.useState<CurrencyCode>(() => {
    const storedCurrency = currencyCodeSchema.safeParse(
      localStorage.getItem(STORAGE_KEY)
    )
    return storedCurrency.success ? storedCurrency.data : DEFAULT_CURRENCY
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
