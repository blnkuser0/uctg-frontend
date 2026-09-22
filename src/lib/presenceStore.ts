"use client";

import { connectSocket } from "./socket-client";

// Module-level store (same shape as pwa/installPromptStore.ts) so every component that needs to
// know "is this person online" — the DM list, a thread header, the group members panel — reads
// the same live set instead of each opening its own socket listener.
const onlineUserIds = new Set<string>();
let started = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function startPresenceTracking(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  const socket = connectSocket();

  socket.on("presence:snapshot", ({ userIds }: { userIds: string[] }) => {
    onlineUserIds.clear();
    userIds.forEach((id) => onlineUserIds.add(id));
    notify();
  });
  socket.on("presence:online", ({ userId }: { userId: string }) => {
    onlineUserIds.add(userId);
    notify();
  });
  socket.on("presence:offline", ({ userId }: { userId: string }) => {
    onlineUserIds.delete(userId);
    notify();
  });
}

export function subscribePresence(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isUserOnline(userId: string): boolean {
  return onlineUserIds.has(userId);
}
