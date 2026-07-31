import { CurrencyProvider } from "./currency-provider"
import { ThemeProvider } from "./theme-provider"

export function AppProviders(props: React.PropsWithChildren) {
  return (
    <ThemeProvider defaultTheme="dark">
      <CurrencyProvider>{props.children}</CurrencyProvider>
    </ThemeProvider>
  )
}
