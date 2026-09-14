import { apiClient } from "@/lib/api-client";
import { Task } from "@/types/task";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function listMyTasks(): Promise<Task[]> {
  const res = await apiClient.get<ApiEnvelope<Task[]>>("/my-tasks");
  return res.data.data;
}
