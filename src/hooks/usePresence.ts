"use client";

import { useEffect } from "react";
import { useSyncExternalStore } from "react";
import { isUserOnline, startPresenceTracking, subscribePresence } from "@/lib/presenceStore";

// Called once (from ChatLayout) to start listening — every other component just reads the
// already-running store via useIsOnline, so presence keeps working across every open thread
// without each one re-subscribing to the socket separately.
export function usePresenceTracking() {
  useEffect(() => {
    startPresenceTracking();
  }, []);
}

export function useIsOnline(userId: string | null | undefined): boolean {
  return useSyncExternalStore(
    subscribePresence,
    () => (userId ? isUserOnline(userId) : false),
    () => false
  );
}
