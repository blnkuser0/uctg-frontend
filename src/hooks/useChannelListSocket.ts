"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectSocket } from "@/lib/socket-client";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Keeps the conversation list itself live — someone starting a DM with you, adding you to a
 * group, renaming a group, or changing its membership. `chat:message:created` already bumps
 * this list (see useChannelSocket), so this only needs the two channel-level events the backend
 * emits (channel.controller.ts's createDm/createGroup/updateGroup) to the affected members.
 */
export function useChannelListSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = connectSocket();

    function onChannelChanged() {
      queryClient.invalidateQueries({ queryKey: queryKeys.channels() });
    }

    socket.on("chat:channel:created", onChannelChanged);
    socket.on("chat:channel:updated", onChannelChanged);
    return () => {
      socket.off("chat:channel:created", onChannelChanged);
      socket.off("chat:channel:updated", onChannelChanged);
    };
  }, [queryClient]);
}
