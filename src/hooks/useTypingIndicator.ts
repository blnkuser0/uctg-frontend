"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { connectSocket } from "@/lib/socket-client";

// If no fresh "stop" (or repeat "start") arrives within this window, assume the person
// stopped typing — covers a dropped event (closed tab, lost connection) without the indicator
// getting stuck on forever.
const TYPING_TIMEOUT_MS = 4000;
// How often notifyTyping() actually re-announces "start" while someone keeps typing, so every
// keystroke doesn't turn into a socket emit.
const THROTTLE_MS = 2000;

interface TypingEvent {
  channelId: string;
  userId: string;
  name: string;
  typing: boolean;
}

export function useTypingIndicator(channelId: string, currentUserId: string) {
  const [typingNames, setTypingNames] = useState<string[]>([]);
  const namesRef = useRef<Map<string, string>>(new Map());
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const lastSentAtRef = useRef(0);

  useEffect(() => {
    const socket = connectSocket();
    const timers = timersRef.current;
    const names = namesRef.current;

    function sync() {
      setTypingNames([...names.values()]);
    }

    function clearFor(userId: string) {
      const timer = timers.get(userId);
      if (timer) clearTimeout(timer);
      timers.delete(userId);
      names.delete(userId);
    }

    function onTyping(event: TypingEvent) {
      if (event.channelId !== channelId || event.userId === currentUserId) return;
      clearFor(event.userId);
      if (event.typing) {
        names.set(event.userId, event.name);
        timers.set(
          event.userId,
          setTimeout(() => {
            clearFor(event.userId);
            sync();
          }, TYPING_TIMEOUT_MS)
        );
      }
      sync();
    }

    socket.on("chat:typing", onTyping);
    return () => {
      socket.off("chat:typing", onTyping);
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
      names.clear();
    };
  }, [channelId, currentUserId]);

  // Stable across renders (channelId only) — MessageComposer's cleanup effect closes over
  // onStopTyping and re-runs whenever ITS identity changes, so a fresh closure every render here
  // would fire a stop event (and re-trigger a state update on every listener) on every render,
  // in a self-sustaining loop. useCallback keeps it the same function until the channel changes.
  const notifyTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastSentAtRef.current < THROTTLE_MS) return;
    lastSentAtRef.current = now;
    connectSocket().emit("typing:start", channelId);
  }, [channelId]);

  const notifyStopTyping = useCallback(() => {
    lastSentAtRef.current = 0;
    connectSocket().emit("typing:stop", channelId);
  }, [channelId]);

  return { typingNames, notifyTyping, notifyStopTyping };
}
