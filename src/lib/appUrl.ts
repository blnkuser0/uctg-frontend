"use client";

import { useSyncExternalStore } from "react";

const subscribeNothing = () => () => undefined;

// The public address of the app. Anything that gets printed or sent to someone
// (ID card QR codes, login links) must point at the real site no matter where it
// was generated (e.g. localhost or a preview URL), so NEXT_PUBLIC_APP_URL wins.
export function useAppOrigin(): string {
  return useSyncExternalStore(
    subscribeNothing,
    () => (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/+$/, ""),
    () => ""
  );
}
