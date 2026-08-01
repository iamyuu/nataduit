import * as React from "react"
import { toast } from "sonner"
import { useRegisterSW } from "virtual:pwa-register/react"

export function PwaNotifications() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
  } = useRegisterSW()

  React.useEffect(() => {
    if (!offlineReady) return

    toast("Ready to work offline")
    setOfflineReady(false)
  }, [offlineReady, setOfflineReady])

  return null
}
