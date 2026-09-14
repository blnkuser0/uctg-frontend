"use client";

import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import * as authService from "@/services/auth.service";

export function useUpdateProfile() {
  const { refetchMe } = useAuth();
  return useMutation({
    mutationFn: (input: { name?: string }) => authService.updateMe(input),
    onSuccess: () => refetchMe(),
  });
}

export function useUploadAvatar() {
  const { refetchMe } = useAuth();
  return useMutation({
    mutationFn: (file: File) => authService.uploadAvatar(file),
    onSuccess: () => refetchMe(),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) => authService.changePassword(input),
  });
}
