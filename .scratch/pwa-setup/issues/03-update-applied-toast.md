# 03 — Update-applied toast

**What to build:** When a new deployed version's service worker activates automatically in the background (per the `autoUpdate` registration from ticket 01), a one-time informational "Updated to the latest version" toast — never a reload prompt or mid-session interruption.

**Blocked by:** 01 (Installable, offline-capable app shell), 02 (Offline-ready toast)

**Status:** done

- [x] `registerType: "autoUpdate"` confirmed to apply new service worker versions without user action
- [x] The post-activation signal (`needRefresh` or equivalent) triggers exactly one informational toast, with no action button and no reload requirement
- [x] Verified end-to-end: rebuild with a changed asset, reload the preview, confirm the toast appears and no reload-prompt UI ever shows
