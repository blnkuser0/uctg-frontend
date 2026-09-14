import { apiClient } from "@/lib/api-client";
import { CreateUserInput, UpdateUserInput, User } from "@/types/user";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function listUsers(): Promise<User[]> {
  const res = await apiClient.get<ApiEnvelope<User[]>>("/users");
  return res.data.data;
}

export async function searchUsers(q: string): Promise<User[]> {
  const res = await apiClient.get<ApiEnvelope<User[]>>("/users/search", { params: { q } });
  return res.data.data;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const res = await apiClient.post<ApiEnvelope<User>>("/users", input);
  return res.data.data;
}

export async function updateUser(userId: string, input: UpdateUserInput): Promise<User> {
  const res = await apiClient.patch<ApiEnvelope<User>>(`/users/${userId}`, input);
  return res.data.data;
}

export async function deactivateUser(userId: string): Promise<User> {
  const res = await apiClient.delete<ApiEnvelope<User>>(`/users/${userId}`);
  return res.data.data;
}
