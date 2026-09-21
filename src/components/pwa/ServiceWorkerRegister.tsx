"use client";

import { useEffect } from "react";
import { startInstallPromptCapture } from "./installPromptStore";

const ENABLE_SW_DEV = process.env.NEXT_PUBLIC_ENABLE_SW_DEV === "true";

export function ServiceWorkerRegister() {
  useEffect(() => {
    startInstallPromptCapture();
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const isDev = process.env.NODE_ENV === "development";

    if (isDev && !ENABLE_SW_DEV) {
      // Keep dev clean: unregister any previously-installed SW and clear its caches.
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => void reg.unregister());
      });
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((key) => void caches.delete(key)));
      }
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      // The app stays fully usable online when a browser or host does not support SWs.
      .catch(() => undefined);
  }, []);

  return null;
}
