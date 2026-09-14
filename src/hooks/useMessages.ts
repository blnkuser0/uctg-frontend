"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
