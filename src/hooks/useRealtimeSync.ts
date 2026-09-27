"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectSocket } from "@/lib/socket-client";
import { useAuth } from "@/providers/AuthProvider";

type QueryKeyPrefix = readonly string[];

// Everything a task/project change can affect, whichever page it's shown on.
const PROJECT_WORK: QueryKeyPrefix[] = [["projects"], ["tasks"], ["my-tasks"], ["mentions"]];

// Backend resource (see realtimeSync.middleware.ts) -> the cached queries that show it.
const KEYS_BY_RESOURCE: Record<string, QueryKeyPrefix[]> = {
  leaves: [["leaves"]],
  accomplishments: [["accomplishments"]],
  timeclock: [["timeclock"]],
  organization: [["organization"]],
  platform: [["platform"]],
  users: [["users"], ["roles"], ["id-card"]],
  roles: [["roles"], ["users"]],
  // A project's members also decide who sees its chat channel.
  projects: [...PROJECT_WORK, ["channels"]],
  stages: PROJECT_WORK,
  labels: PROJECT_WORK,
  tasks: PROJECT_WORK,
  comments: PROJECT_WORK,
  "time-entries": PROJECT_WORK,
};

// Several changes often land together (a bulk action, a drag that fires two events) — refetch once.
const BATCH_MS = 250;

/**
 * Keeps every page live. The server pings `data:changed { resource }` for each successful write
 * (and pm:* events cover project work, including across organizations); we just invalidate the
 * matching cached queries so whatever page is open refetches — through the normal API, so every
 * viewer only ever gets what their own role allows. On a reconnect we refetch everything, since
 * events may have been missed while offline.
 *
 * Mount once, only while signed in (the socket authenticates with the access token).
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const { user, refetchMe } = useAuth();
  const refetchMeRef = useRef(refetchMe);
  useEffect(() => {
    refetchMeRef.current = refetchMe;
  }, [refetchMe]);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    const socket = connectSocket();

    const pending = new Set<string>();
    let timer: ReturnType<typeof setTimeout> | null = null;

    function flush() {
      timer = null;
      const resources = [...pending];
      pending.clear();
      for (const resource of resources) {
        for (const queryKey of KEYS_BY_RESOURCE[resource] ?? []) {
          queryClient.invalidateQueries({ queryKey });
        }
      }
      // Someone's role/permissions may have just changed — including mine. Refresh who I am so the
      // sidebar and permission-gated pages follow without a reload.
      if (resources.includes("users") || resources.includes("roles")) void refetchMeRef.current().catch(() => undefined);
    }

    function schedule(resource: string) {
      pending.add(resource);
      if (!timer) timer = setTimeout(flush, BATCH_MS);
    }

    function onDataChanged(event: { resource?: string }) {
      if (event?.resource) schedule(event.resource);
    }

    function onAny(event: string) {
      if (event.startsWith("pm:") && event !== "pm:notification") schedule("tasks");
    }

    let connectedBefore = socket.connected;
    function onConnect() {
      if (connectedBefore) {
        queryClient.invalidateQueries();
        void refetchMeRef.current().catch(() => undefined);
      }
      connectedBefore = true;
    }

    socket.on("data:changed", onDataChanged);
    socket.onAny(onAny);
    socket.on("connect", onConnect);

    return () => {
      if (timer) clearTimeout(timer);
      socket.off("data:changed", onDataChanged);
      socket.offAny(onAny);
      socket.off("connect", onConnect);
    };
  }, [userId, queryClient]);
}
