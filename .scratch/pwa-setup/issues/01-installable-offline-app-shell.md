# 01 — Installable, offline-capable app shell

**What to build:** A real web app manifest (NataDuit branding, icons, theme colors) and a Workbox-generated service worker that precaches the app shell, so the app can be installed to a home screen and continues to load and work with zero network connectivity.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] Manifest declares name/short_name "NataDuit", theme_color/background_color `#090b0c`, `display: "standalone"`, and valid icon entries (192×192, 512×512, maskable 512×512)
- [ ] Placeholder icon assets exist at the required sizes, generated without adding a new image-processing dependency to package.json
- [ ] `vite-plugin-pwa` configured with `strategies: "generateSW"` and `registerType: "autoUpdate"`
- [ ] Verified against a production build + preview (not the dev server): the app installs (browser install prompt / Lighthouse PWA audit passes) and loads fully with the network disabled
