import { apiClient } from "@/lib/api-client";
import { User } from "@/types/user";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function login(input: { email: string; password: string }): Promise<{ user: User; accessToken: string }> {
  const res = await apiClient.post<ApiEnvelope<{ user: User; accessToken: string }>>("/auth/login", input);
  return res.data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function getMe(): Promise<User> {
  const res = await apiClient.get<ApiEnvelope<User>>("/auth/me");
  return res.data.data;
}

export async function updateMe(input: { name?: string; avatarUrl?: string | null }): Promise<User> {
  const res = await apiClient.patch<ApiEnvelope<User>>("/auth/me", input);
  return res.data.data;
}

export async function changePassword(input: { currentPassword: string; newPassword: string }): Promise<void> {
  await apiClient.post("/auth/change-password", input);
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post("/auth/forgot-password", { email });
}

export async function resetPassword(input: { token: string; newPassword: string }): Promise<void> {
  await apiClient.post("/auth/reset-password", input);
}

export async function uploadAvatar(file: File): Promise<User> {
  const formData = new FormData();
  formData.append("avatar", file);
  const res = await apiClient.post<ApiEnvelope<User>>("/auth/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}
