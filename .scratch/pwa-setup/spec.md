Status: ready-for-agent

# NataDuit PWA Setup

## Problem Statement

NataDuit (the Kakeibo expense tracker) currently only runs as a regular browser tab: no home-screen install, no offline guarantee beyond whatever the browser's own HTTP cache happens to keep, no signal when the app is safe to use without a network, and no way to know a new version has shipped short of a hard refresh. Since expense entries are logged in the moment — often away from reliable connectivity — the app needs to behave like an installed, offline-capable app, not a website. The eventual goal is to wrap it as a Trusted Web Activity (TWA) for Android, which raises the bar further: it needs to *feel* native, including how it handles its own updates.

## Solution

Turn NataDuit into a proper installable PWA using `vite-plugin-pwa`: a real web app manifest (name, icons, theme colors), a Workbox-generated service worker that precaches the app shell so the app loads and works with no network at all, a one-time toast confirming the app is ready to use offline, and a silent background update flow that only surfaces a toast after the update has already applied — never a "click to reload" interruption mid-task.

## User Stories

1. As a user, I want to install NataDuit to my phone's home screen, so that it opens and behaves like a native app rather than a browser tab.
2. As a user, I want the app to load and work with no network connection, so that I can log expenses anywhere, including places with no signal.
3. As a user, I want a clear one-time confirmation that the app is ready to work offline, so that I know I don't need a connection to keep using it.
4. As a user, I want new versions of the app to update automatically in the background, so that I'm never interrupted mid-entry by a "reload to update" prompt.
5. As a user, I want a light, informational notice after the app has updated, so that I know I'm on the latest version without having to do anything myself.
6. As a user, I want the installed app's icon, name, and theme color to look intentional (not a default Vite placeholder), so that it feels like a real, finished app.
7. As a developer, I want the update mechanism to feel native from day one, so that wrapping the app as a TWA later doesn't require rethinking the update UX.
8. As a developer, I want the app's offline capability to require no new runtime dependency on a backend, so that the existing fully-local (Dexie/IndexedDB) data model keeps working unchanged.

## Implementation Decisions

**Manifest & branding**

- App name and short name: **"NataDuit"** (replacing the current `vite-app` placeholder in `index.html`'s `<title>`).
- `theme_color` and `background_color`: `#090b0c` — the app's existing dark-mode `--background` design token, resolved by rendering the actual OKLCH value in a real browser and reading the painted pixel, not by hand-converting OKLCH to hex (which is error-prone).
- `display: "standalone"`.
- Icons: three placeholder assets generated now (192×192, 512×512, and a maskable 512×512 variant) under `public/icons/`, styled with a minimal monogram/wordmark in the app's existing palette. These are explicitly swappable later — real branded icon design is not blocked on this work and is called out under Out of Scope.
- Icon generation itself needs no new project dependency (no `sharp`/image-processing package added to `package.json`); a one-off rendering script (e.g. headless Chromium) run once to produce the static PNG files is sufficient, since the icons don't need to be regenerated as part of the normal build.

**Service worker / offline strategy**

- `vite-plugin-pwa` with `strategies: "generateSW"` (the default, Workbox-generated service worker) — no custom `injectManifest` service worker code needed.
- No runtime caching configuration: NataDuit makes zero network/API calls (all data lives in Dexie/IndexedDB, fully local already), so "offline-first" here means precaching the built JS/CSS/HTML app shell only. There is nothing else to cache.
- `registerType: "autoUpdate"` — a new service worker activates automatically in the background as soon as it's available, with no user action required and no mid-session interruption. This is a deliberate departure from `vite-plugin-pwa`'s other common mode (`"prompt"`, which shows a persistent "reload to update" banner) because the eventual TWA wrapper should feel like a native Android app, and native apps don't ask permission mid-use to finish an update that already downloaded.
- The service worker does not run under the Vite dev server by default; verifying precaching, install, and update behavior requires a production build and preview (`vite build && vite preview`), not `vite dev`.

**Notifications (toasts)**

- Toast system: shadcn's `sonner` component, added via the CLI (`pnpm dlx shadcn add sonner`) — the same vendoring pattern already used this session for `alert-dialog` and `drawer`. A single `<Toaster />` is mounted once at the app root (in `AppProviders` or `App`), styled to match the app's existing dark palette.
- Both required notifications are driven by `vite-plugin-pwa`'s `virtual:pwa-register/react` hook (`useRegisterSW`), which exposes `offlineReady` and `needRefresh` booleans:
  - **Offline-ready toast**: fires once, the first time `offlineReady` flips true (i.e. the first successful precache after install) — e.g. "Ready to work offline."
  - **Update-applied toast**: since the update strategy is `autoUpdate`, the new service worker activates without asking. The toast fires once the update has taken effect and is purely informational — e.g. "Updated to the latest version" — with no reload button and no required action, since by the time the toast shows, the update has already applied for the next natural load.

## Testing Decisions

No new automated test seam. This feature is entirely build-time configuration (the service worker is generated by Workbox at build time, not app logic that runs in Vitest) or thin UI wiring around a third-party hook (`useRegisterSW`) driving a single toast call — the same shape as every other pure-UI ticket this session (the calendar grid, floating input, alert dialog, currency settings sheet), none of which received Vitest coverage. Verification is manual, against a real production build:

- `vite build && vite preview`, confirm the app loads with the network disabled (DevTools offline mode or equivalent).
- Confirm the manifest is valid and installable (browser's install prompt / Lighthouse PWA check).
- Confirm the offline-ready toast appears once, on first successful precache.
- Confirm a rebuilt/redeployed version applies automatically and the update-applied toast appears, with no reload prompt shown at any point.

## Out of Scope

- **Real branded icon/logo design** — the placeholder icons generated here are swappable; actual visual design is a separate, later effort with no direction decided yet.
- **Actual TWA packaging** (Bubblewrap, Digital Asset Links / `assetlinks.json` hosting, Play Store listing) — a deployment-time effort once the PWA is live at a real domain. This spec only gets the web app itself TWA-ready in spirit: a valid manifest, offline capability, and native-feeling update behavior.
- **Runtime/API caching strategies** — not applicable; the app has no network calls to cache. If a future effort adds a backend or sync, runtime caching would need to be revisited then, not now.
- **Push notifications** — a separate service-worker capability from the offline/update toasts described here; not requested and not covered.

## Further Notes

- `vite-plugin-pwa` and a minimal `VitePWA({ registerType: 'autoUpdate' })` call in `vite.config.ts` have already been added to the working tree (uncommitted) ahead of this spec — treat that as a starting point to build on, not something to redo from scratch.
- This spec was preceded by a wayfinder map (`.scratch/pwa-setup/map.md`) that resolved the same decisions and sketched four execution tickets (`.scratch/pwa-setup/issues/`) under a "carry execution into the map, skip the spec" plan. Since a spec now exists instead, those tickets may be worth reconciling against this document (either treated as superseded, or kept as the ticket breakdown for implementing this spec) — flagging for a decision, not resolving it here.
