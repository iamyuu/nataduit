import * as React from "react"
import {
  dateOrderSchema,
  DEFAULT_DATE_ORDER,
  type DateOrder,
} from "@/domain/date-order"

const STORAGE_KEY = "date-order"

interface DateOrderProviderState {
  dateOrder: DateOrder
  setDateOrder: (dateOrder: DateOrder) => void
}

const DateOrderProviderContext = React.createContext<
  DateOrderProviderState | undefined
>(undefined)

export function DateOrderProvider(props: React.PropsWithChildren) {
  const [dateOrder, setDateOrderState] = React.useState<DateOrder>(() => {
    const storedDateOrder = dateOrderSchema.safeParse(
      localStorage.getItem(STORAGE_KEY)
    )
    return storedDateOrder.success ? storedDateOrder.data : DEFAULT_DATE_ORDER
  })

  const setDateOrder = React.useCallback((nextDateOrder: DateOrder) => {
    localStorage.setItem(STORAGE_KEY, nextDateOrder)
    setDateOrderState(nextDateOrder)
  }, [])

  const value = React.useMemo(
    () => ({ dateOrder, setDateOrder }),
    [dateOrder, setDateOrder]
  )

  return (
    <DateOrderProviderContext.Provider value={value}>
      {props.children}
    </DateOrderProviderContext.Provider>
  )
}

export function useDateOrder() {
  const context = React.useContext(DateOrderProviderContext)

  if (context === undefined) {
    throw new Error("useDateOrder must be used within a DateOrderProvider")
  }

  return context
}
