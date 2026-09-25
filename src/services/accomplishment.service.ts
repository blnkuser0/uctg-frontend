import { apiClient } from "@/lib/api-client";
import { Accomplishment, AccomplishmentFilters, CreateAccomplishmentInput, UpdateAccomplishmentInput } from "@/types/accomplishment";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function createAccomplishment(input: CreateAccomplishmentInput): Promise<Accomplishment> {
  const res = await apiClient.post<ApiEnvelope<Accomplishment>>("/accomplishments", input);
  return res.data.data;
}

export async function listMyAccomplishments(filters: AccomplishmentFilters = {}): Promise<Accomplishment[]> {
  const res = await apiClient.get<ApiEnvelope<Accomplishment[]>>("/accomplishments/mine", { params: filters });
  return res.data.data;
}

export async function listAllAccomplishments(filters: AccomplishmentFilters = {}): Promise<Accomplishment[]> {
  const res = await apiClient.get<ApiEnvelope<Accomplishment[]>>("/accomplishments", { params: filters });
  return res.data.data;
}

export async function updateAccomplishment(id: string, input: UpdateAccomplishmentInput): Promise<Accomplishment> {
  const res = await apiClient.patch<ApiEnvelope<Accomplishment>>(`/accomplishments/${id}`, input);
  return res.data.data;
}

export async function deleteAccomplishment(id: string): Promise<void> {
  await apiClient.delete(`/accomplishments/${id}`);
}
