import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "ugnexa-catalyst",
    name: "Ugnexa Catalyst",
    short_name: "Ugnexa Catalyst",
    description: "Team workspace for projects, time tracking, leaves, attendance, and chat",
    // "/" (not "/login"): the root page routes signed-in users to their overview
    // and everyone else to login, so an installed app doesn't reopen on the
    // login form while a session is still valid.
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#172033",
    theme_color: "#0891b2",
    icons: [
      { src: "/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-192x192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
