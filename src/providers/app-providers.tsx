import { Toaster } from "@/components/atoms/sonner"
import { CurrencyProvider } from "./currency-provider"
import { ThemeProvider } from "./theme-provider"

export function AppProviders(props: React.PropsWithChildren) {
  return (
    <ThemeProvider defaultTheme="dark">
      <CurrencyProvider>
        {props.children}
        <Toaster position="top-center" />
      </CurrencyProvider>
    </ThemeProvider>
  )
}
