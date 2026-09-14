"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import * as channelService from "@/services/channel.service";
import { CreateGroupInput, UpdateGroupInput } from "@/types/channel";

export function useChannels() {
  return useQuery({
    queryKey: queryKeys.channels(),
    queryFn: channelService.listChannels,
  });
}

function useInvalidateChannels() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.channels() });
}

export function useGetOrCreateDm() {
  const invalidate = useInvalidateChannels();
  return useMutation({
    mutationFn: (userId: string) => channelService.getOrCreateDm(userId),
    onSuccess: invalidate,
  });
}

export function useCreateGroup() {
  const invalidate = useInvalidateChannels();
  return useMutation({
    mutationFn: (input: CreateGroupInput) => channelService.createGroup(input),
    onSuccess: invalidate,
  });
}

export function useUpdateGroup() {
  const invalidate = useInvalidateChannels();
  return useMutation({
    mutationFn: ({ channelId, input }: { channelId: string; input: UpdateGroupInput }) =>
      channelService.updateGroup(channelId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteGroup() {
  const invalidate = useInvalidateChannels();
  return useMutation({
    mutationFn: (channelId: string) => channelService.deleteGroup(channelId),
    onSuccess: invalidate,
  });
}

export function useMarkChannelRead() {
  const invalidate = useInvalidateChannels();
  return useMutation({
    mutationFn: (channelId: string) => channelService.markChannelRead(channelId),
    onSuccess: invalidate,
  });
}
