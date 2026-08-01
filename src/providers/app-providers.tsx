import { Toaster } from "@/components/atoms/sonner"
import { CurrencyProvider } from "./currency-provider"
import { DateOrderProvider } from "./date-order-provider"
import { ThemeProvider } from "./theme-provider"

export function AppProviders(props: React.PropsWithChildren) {
  return (
    <ThemeProvider defaultTheme="dark">
      <CurrencyProvider>
        <DateOrderProvider>
          {props.children}
          <Toaster position="top-center" />
        </DateOrderProvider>
      </CurrencyProvider>
    </ThemeProvider>
  )
}
