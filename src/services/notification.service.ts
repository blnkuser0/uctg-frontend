import { apiClient } from "@/lib/api-client";
import { AppNotification } from "@/types/notification";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function listNotifications(): Promise<AppNotification[]> {
  const res = await apiClient.get<ApiEnvelope<AppNotification[]>>("/notifications");
  return res.data.data;
}

export async function countUnread(): Promise<number> {
  const res = await apiClient.get<ApiEnvelope<{ count: number }>>("/notifications/count");
  return res.data.data.count;
}

export async function markRead(ids?: string[]): Promise<void> {
  await apiClient.post("/notifications/read", { ids });
}
