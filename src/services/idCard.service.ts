import { apiClient } from "@/lib/api-client";
import { IdCardData, IdVerification } from "@/types/idCard";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function getMyIdCard(): Promise<IdCardData> {
  const res = await apiClient.get<ApiEnvelope<IdCardData>>("/users/me/id-card");
  return res.data.data;
}

export async function getUserIdCard(userId: string): Promise<IdCardData> {
  const res = await apiClient.get<ApiEnvelope<IdCardData>>(`/users/${userId}/id-card`);
  return res.data.data;
}

export async function verifyId(token: string): Promise<IdVerification> {
  const res = await apiClient.get<ApiEnvelope<IdVerification>>(`/public/verify/${token}`);
  return res.data.data;
}
