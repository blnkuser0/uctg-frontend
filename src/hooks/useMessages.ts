"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { queryKeys } from "@/lib/queryKeys";
import * as messageService from "@/services/message.service";
import { CreateMessageInput, Message } from "@/types/message";

export function useMessages(channelId: string) {
  return useQuery({
    queryKey: queryKeys.messages(channelId),
    queryFn: () => messageService.listMessages(channelId),
    enabled: !!channelId,
  });
}

export function useSendMessage(channelId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMessageInput) => messageService.createMessage(channelId, input),
    onSuccess: (message) => {
      queryClient.setQueryData<Message[]>(queryKeys.messages(channelId), (old) => (old ? [...old, message] : [message]));
      queryClient.invalidateQueries({ queryKey: queryKeys.channels() });
    },
  });
}

export function useUpdateMessage(channelId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, message }: { messageId: string; message: string }) =>
      messageService.updateMessage(messageId, message),
    onSuccess: (updated) => {
      queryClient.setQueryData<Message[]>(queryKeys.messages(channelId), (old) =>
        old?.map((m) => (m._id === updated._id ? updated : m))
      );
    },
  });
}

export function useAddAttachments(channelId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ files, text }: { files: File[]; text?: string }) =>
      messageService.addAttachments(channelId, files, text),
    onSuccess: (message) => {
      queryClient.setQueryData<Message[]>(queryKeys.messages(channelId), (old) => (old ? [...old, message] : [message]));
      queryClient.invalidateQueries({ queryKey: queryKeys.channels() });
    },
  });
}

export function useDeleteMessage(channelId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => messageService.deleteMessage(messageId),
    onSuccess: (_result, messageId) => {
      queryClient.setQueryData<Message[]>(queryKeys.messages(channelId), (old) =>
        old?.filter((m) => m._id !== messageId)
      );
    },
  });
}

// Reactions and pin both replace the message in every cache they might appear in (the main
// thread AND the pinned-messages list) — the socket listener in useChannelSocket already does
// the same for the "someone else reacted/pinned" case, this covers the immediate optimistic-ish
// response to the action the current user just took.
function useReplaceMessageEverywhere(channelId: string) {
  const queryClient = useQueryClient();
  return (updated: Message) => {
    queryClient.setQueryData<Message[]>(queryKeys.messages(channelId), (old) =>
      old?.map((m) => (m._id === updated._id ? updated : m))
    );
    queryClient.setQueryData<Message[]>(queryKeys.pinnedMessages(channelId), (old) => {
      if (!old) return old;
      const wasPinned = old.some((m) => m._id === updated._id);
      if (updated.pinnedAt) {
        return wasPinned ? old.map((m) => (m._id === updated._id ? updated : m)) : [updated, ...old];
      }
      return old.filter((m) => m._id !== updated._id);
    });
  };
}

export function useReactToMessage(channelId: string) {
  const replaceEverywhere = useReplaceMessageEverywhere(channelId);
  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      messageService.reactToMessage(messageId, emoji),
    onSuccess: replaceEverywhere,
  });
}

export function useTogglePinMessage(channelId: string) {
  const replaceEverywhere = useReplaceMessageEverywhere(channelId);
  return useMutation({
    mutationFn: (messageId: string) => messageService.togglePinMessage(messageId),
    onSuccess: replaceEverywhere,
  });
}

export function usePinnedMessages(channelId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.pinnedMessages(channelId),
    queryFn: () => messageService.listPinnedMessages(channelId),
    enabled: enabled && !!channelId,
  });
}

// Search is on-demand (typed into a box, not something to keep live/cached across channels), so
// this is plain local state rather than a cached query — there's nothing worth re-showing from
// cache once the user has moved on to a different search term or closed the panel.
export function useChannelSearch(channelId: string) {
  const [results, setResults] = useState<Message[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  async function search(q: string) {
    const query = q.trim();
    if (!query) {
      setResults(null);
      return;
    }
    setIsSearching(true);
    try {
      setResults(await messageService.searchChannel(channelId, query));
    } finally {
      setIsSearching(false);
    }
  }

  function clear() {
    setResults(null);
  }

  return { results, isSearching, search, clear };
}
