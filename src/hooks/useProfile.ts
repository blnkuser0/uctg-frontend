"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { queryKeys } from "@/lib/queryKeys";
import * as authService from "@/services/auth.service";

// The company ID shows the user's name and photo, so it must refresh with them.
function useRefreshIdentity() {
  const { refetchMe } = useAuth();
  const queryClient = useQueryClient();
  return async () => {
    await refetchMe();
    await queryClient.invalidateQueries({ queryKey: queryKeys.idCard("me") });
  };
}

export function useUpdateProfile() {
  const refreshIdentity = useRefreshIdentity();
  return useMutation({
    mutationFn: (input: { name?: string }) => authService.updateMe(input),
    onSuccess: refreshIdentity,
  });
}

export function useUploadAvatar() {
  const refreshIdentity = useRefreshIdentity();
  return useMutation({
    mutationFn: (file: File) => authService.uploadAvatar(file),
    onSuccess: refreshIdentity,
  });
}

export function useChangePassword() {
  const { refetchMe } = useAuth();
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) => authService.changePassword(input),
    // Picking their own password clears the "change your temporary password" banner.
    onSuccess: () => refetchMe().catch(() => undefined),
  });
}
