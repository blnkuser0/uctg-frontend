import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "ugnexa-catalyst",
    name: "Ugnexa Catalyst",
    short_name: "Ugnexa Catalyst",
    description: "Team workspace for projects, time tracking, leaves, attendance, and chat",
    start_url: "/login",
    display: "standalone",
    background_color: "#172033",
    theme_color: "#0891b2",
    icons: [
      { src: "/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
