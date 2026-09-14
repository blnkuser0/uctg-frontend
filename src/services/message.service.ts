import { apiClient } from "@/lib/api-client";
import { CreateMessageInput, Message } from "@/types/message";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function listMessages(channelId: string): Promise<Message[]> {
  const res = await apiClient.get<ApiEnvelope<Message[]>>(`/channels/${channelId}/messages`);
  return res.data.data;
}

export async function createMessage(channelId: string, input: CreateMessageInput): Promise<Message> {
  const res = await apiClient.post<ApiEnvelope<Message>>(`/channels/${channelId}/messages`, input);
  return res.data.data;
}

export async function updateMessage(messageId: string, message: string): Promise<Message> {
  const res = await apiClient.patch<ApiEnvelope<Message>>(`/messages/${messageId}`, { message });
  return res.data.data;
}

export async function deleteMessage(messageId: string): Promise<void> {
  await apiClient.delete(`/messages/${messageId}`);
}

export async function addAttachments(channelId: string, files: File[], text?: string): Promise<Message> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  if (text) formData.append("message", text);
  const res = await apiClient.post<ApiEnvelope<Message>>(`/channels/${channelId}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}
