"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectSocket } from "@/lib/socket-client";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Every authenticated socket connection auto-joins its `user:{id}` room
 * server-side, so this just needs to connect once and listen — no
 * project subscription required, unlike useProjectSocket.
 */
export function useNotificationSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = connectSocket();

    function onNotification() {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationsCount() });
    }

    socket.on("pm:notification", onNotification);
    return () => {
      socket.off("pm:notification", onNotification);
    };
  }, [queryClient]);
}
