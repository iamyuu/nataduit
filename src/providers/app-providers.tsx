import { ThemeProvider } from "./theme-provider"

export function AppProviders(props: React.PropsWithChildren) {
  return <ThemeProvider defaultTheme="dark">{props.children}</ThemeProvider>
}
