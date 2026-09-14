import { apiClient } from "@/lib/api-client";
import { Channel, CreateGroupInput, UpdateGroupInput } from "@/types/channel";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function listChannels(): Promise<Channel[]> {
  const res = await apiClient.get<ApiEnvelope<Channel[]>>("/channels");
  return res.data.data;
}

export async function getOrCreateDm(userId: string): Promise<Channel> {
  const res = await apiClient.post<ApiEnvelope<Channel>>("/channels/dm", { userId });
  return res.data.data;
}

export async function createGroup(input: CreateGroupInput): Promise<Channel> {
  const res = await apiClient.post<ApiEnvelope<Channel>>("/channels", input);
  return res.data.data;
}

export async function updateGroup(channelId: string, input: UpdateGroupInput): Promise<Channel> {
  const res = await apiClient.patch<ApiEnvelope<Channel>>(`/channels/${channelId}`, input);
  return res.data.data;
}

export async function deleteGroup(channelId: string): Promise<void> {
  await apiClient.delete(`/channels/${channelId}`);
}

export async function markChannelRead(channelId: string): Promise<void> {
  await apiClient.post(`/channels/${channelId}/read`);
}
