"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectSocket } from "@/lib/socket-client";
import { queryKeys } from "@/lib/queryKeys";
import { Message } from "@/types/message";

export function useChannelSocket(channelId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!channelId) return;
    const socket = connectSocket();
    socket.emit("channel:subscribe", channelId);

    function onCreated({ message }: { message: Message }) {
      queryClient.setQueryData<Message[]>(queryKeys.messages(channelId), (old) =>
        old && !old.some((m) => m._id === message._id) ? [...old, message] : old
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.channels() });
    }

    function onUpdated({ message }: { message: Message }) {
      queryClient.setQueryData<Message[]>(queryKeys.messages(channelId), (old) =>
        old?.map((m) => (m._id === message._id ? message : m))
      );
      // Reactions and pins both travel over this same event — keep the Pinned panel in sync too,
      // for a pin/unpin (or an edit to an already-pinned message) that someone ELSE just did.
      queryClient.setQueryData<Message[]>(queryKeys.pinnedMessages(channelId), (old) => {
        if (!old) return old;
        const wasPinned = old.some((m) => m._id === message._id);
        if (message.pinnedAt) {
          return wasPinned ? old.map((m) => (m._id === message._id ? message : m)) : [message, ...old];
        }
        return old.filter((m) => m._id !== message._id);
      });
    }

    function onDeleted({ messageId }: { messageId: string }) {
      queryClient.setQueryData<Message[]>(queryKeys.messages(channelId), (old) =>
        old?.filter((m) => m._id !== messageId)
      );
    }

    socket.on("chat:message:created", onCreated);
    socket.on("chat:message:updated", onUpdated);
    socket.on("chat:message:deleted", onDeleted);

    return () => {
      socket.emit("channel:unsubscribe", channelId);
      socket.off("chat:message:created", onCreated);
      socket.off("chat:message:updated", onUpdated);
      socket.off("chat:message:deleted", onDeleted);
    };
  }, [channelId, queryClient]);
}
