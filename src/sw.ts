/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import { NetworkOnly, Serwist, setCacheNameDetails } from "serwist";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
} & SerwistGlobalConfig;

// Bump this prefix whenever a breaking cache-shape change ships.
setCacheNameDetails({ prefix: "ugnexa-catalyst-v2026-09-16" });

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: false, // never force-reload tabs mid-work
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // The API and Socket.IO live on another origin. Serwist's default cache would
    // keep authenticated API responses for an hour and hand them to the next
    // person on a shared browser after logout — never cache them.
    {
      matcher: ({ url }) =>
        url.origin !== self.location.origin && (url.pathname.startsWith("/api/") || url.pathname.startsWith("/socket.io/")),
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();

// Purge API responses cached by earlier versions, which cached cross-origin GETs.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key.includes("cross-origin")).map((key) => caches.delete(key))))
  );
});
