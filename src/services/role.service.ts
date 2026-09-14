import { apiClient } from "@/lib/api-client";
import { CreateRoleInput, Role, UpdateRoleInput } from "@/types/role";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function listRoles(): Promise<Role[]> {
  const res = await apiClient.get<ApiEnvelope<Role[]>>("/roles");
  return res.data.data;
}

export async function createRole(input: CreateRoleInput): Promise<Role> {
  const res = await apiClient.post<ApiEnvelope<Role>>("/roles", input);
  return res.data.data;
}

export async function updateRole(roleId: string, input: UpdateRoleInput): Promise<Role> {
  const res = await apiClient.patch<ApiEnvelope<Role>>(`/roles/${roleId}`, input);
  return res.data.data;
}

export async function deleteRole(roleId: string): Promise<void> {
  await apiClient.delete(`/roles/${roleId}`);
}
