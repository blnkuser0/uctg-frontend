/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import { Serwist, setCacheNameDetails } from "serwist";
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
  runtimeCaching: defaultCache,
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
