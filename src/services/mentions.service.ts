import { apiClient } from "@/lib/api-client";
import { Mention } from "@/types/mention";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function listMentions(): Promise<Mention[]> {
  const res = await apiClient.get<ApiEnvelope<Mention[]>>("/mentions");
  return res.data.data;
}
