## Destination

**Reached.** A working, installable PWA for the NataDuit (Kakeibo) app: `vite-plugin-pwa` configured offline-first (precached app shell via Workbox `generateSW`), a manifest with real placeholder branding, a toast when the app becomes available offline, and a toast when a new version has updated in the background — set up to feel native, since the end goal is wrapping it as a TWA.

This effort ended up routed through a spec (`.scratch/pwa-setup/spec.md`) and a `/to-tickets` breakdown (`.scratch/pwa-setup/issues/01-03`, local-ticket-template format) rather than resolved directly on this map's original 4 wayfinder-format tickets — those were superseded and removed when the spec landed. All 3 replacement tickets are done.

## Notes

- **Execution carried into the map.** All open decisions were resolved during charting; tickets are execution units (Task type), not further decision points. Resolve via `/implement` + `/code-review`, same as the rest of this session.
- Domain/reference: `.scratch/kakeibo-expense-tracker/spec.md`. Existing dark theme background token (`--background` in `.dark`) resolves to `#090b0c` — verified via actual browser pixel rendering, not hand-converted from OKLCH.
- App name / short name: **NataDuit**.
- No existing toast, manifest, or service worker in the repo. Icons directory doesn't exist yet.
- The app has no network calls (Dexie/IndexedDB is fully local) — offline-first here is really just "precache the app shell," no runtime API caching needed.
- Update strategy is `autoUpdate` (silent background update, informational-only toast on completion) rather than `prompt` (reload-required banner) — chosen because the end goal is a TWA and native apps don't interrupt an active session to ask permission to update.
- Toasts: shadcn's `sonner` component, added via `pnpm dlx shadcn add sonner` — same vendoring pattern already used for `alert-dialog`/`drawer` this session.

## Decisions so far

- Destination named — decisions carried straight into execution, no separate spec-writing pass.
- Manifest identity: name/short_name "NataDuit"; theme_color/background_color `#090b0c` (the app's existing dark-mode background).
- Icons: generate a simple placeholder now (swappable later), not blocked on real branding.
- Toast system: shadcn `sonner`.
- Update UX: `registerType: "autoUpdate"`; toast is informational only ("Updated to the latest version"), no reload-prompt — matches native/TWA update behavior.
- Offline-ready toast fires once, on the `offlineReady` flag from `vite-plugin-pwa`'s `virtual:pwa-register/react` hook (first successful precache).
- **Correction discovered during ticket 03**: in `autoUpdate` mode, `useRegisterSW()`'s `needRefresh` flag is never set (confirmed via the plugin's own source) — the plugin calls `onNeedReload()` instead, the instant the new SW activates, with no time to show a toast first. Implementation sets a `sessionStorage` flag then reloads; the toast shows on the next mount, deferred one macrotask past `<Toaster/>`'s subscribe effect (a real, verified timing bug, not a superstition workaround).

## Not yet specified

- Real branded icon/logo design to replace the placeholder — in scope eventually, no design direction decided yet.

## Out of scope

- Actual TWA packaging (Bubblewrap, Digital Asset Links / `assetlinks.json` hosting, Play Store listing) — a separate deployment-time effort once the PWA is live at a real domain; this map only gets the web app itself TWA-ready in spirit (native-feeling update UX, valid manifest, offline-capable).
