# 02 — Offline-ready toast

**What to build:** shadcn's `sonner` toast system, mounted once at the app root, and a one-time "Ready to work offline" toast the first time the app finishes precaching for offline use.

**Blocked by:** 01 (Installable, offline-capable app shell)

**Status:** ready-for-agent

- [ ] `sonner` added via `pnpm dlx shadcn add sonner`, `<Toaster />` mounted once, themed to match the existing dark palette
- [ ] `useRegisterSW`'s `offlineReady` flag triggers exactly one toast, once, on first successful precache
- [ ] Verified against a production build + preview (not the dev server)
