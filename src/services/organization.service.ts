import { apiClient } from "@/lib/api-client";
import { Organization, UpdateOrganizationInput } from "@/types/organization";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function getOrganization(): Promise<Organization> {
  const res = await apiClient.get<ApiEnvelope<Organization>>("/organization");
  return res.data.data;
}

export async function updateOrganization(input: UpdateOrganizationInput): Promise<Organization> {
  const res = await apiClient.patch<ApiEnvelope<Organization>>("/organization", input);
  return res.data.data;
}

export async function listClientOrganizations(): Promise<Organization[]> {
  const res = await apiClient.get<ApiEnvelope<Organization[]>>("/organization/clients");
  return res.data.data;
}

export async function createClientOrganization(input: { name: string }): Promise<Organization> {
  const res = await apiClient.post<ApiEnvelope<Organization>>("/organization", input);
  return res.data.data;
}
