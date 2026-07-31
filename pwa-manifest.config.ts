import type { ManifestOptions } from "vite-plugin-pwa"

export const pwaManifest: Partial<ManifestOptions> = {
  name: "NataDuit",
  short_name: "NataDuit",
  theme_color: "#090b0c",
  background_color: "#090b0c",
  display: "standalone",
  icons: [
    {
      src: "/icons/icon-192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: "/icons/icon-512.png",
      sizes: "512x512",
      type: "image/png",
    },
    {
      src: "/icons/maskable-icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
}
