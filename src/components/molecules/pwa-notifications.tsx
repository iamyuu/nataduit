import * as React from "react"
import { toast } from "sonner"
import { useRegisterSW } from "virtual:pwa-register/react"

const UPDATE_APPLIED_KEY = "pwa-update-applied"

export function PwaNotifications() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
  } = useRegisterSW({
    // registerType is "autoUpdate", so the new service worker takes control and the
    // page reloads automatically with no user action. There's no moment to show a
    // toast before the reload — mark it, reload, then show the toast on next load.
    onNeedReload() {
      sessionStorage.setItem(UPDATE_APPLIED_KEY, "1")
      window.location.reload()
    },
  })

  React.useEffect(() => {
    if (!offlineReady) return

    toast("Ready to work offline")
    setOfflineReady(false)
  }, [offlineReady, setOfflineReady])

  React.useEffect(() => {
    if (sessionStorage.getItem(UPDATE_APPLIED_KEY) !== "1") return

    sessionStorage.removeItem(UPDATE_APPLIED_KEY)
    // <Toaster/> is a sibling rendered after this component in AppProviders, so on
    // initial mount its subscribe effect hasn't run yet when this effect fires in the
    // same commit — a synchronous toast() call here is published with no subscriber
    // and silently dropped. Deferring to the next macrotask runs after both effects.
    const timeoutId = setTimeout(
      () => toast("Updated to the latest version"),
      0
    )
    return () => clearTimeout(timeoutId)
  }, [])

  return null
}
