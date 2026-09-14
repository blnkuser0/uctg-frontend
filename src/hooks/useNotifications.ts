"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import * as notificationService from "@/services/notification.service";

export function useNotifications() {
  return useQuery({ queryKey: queryKeys.notifications(), queryFn: notificationService.listNotifications });
}

export function useUnreadNotificationCount() {
  return useQuery({ queryKey: queryKeys.notificationsCount(), queryFn: notificationService.countUnread });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids?: string[]) => notificationService.markRead(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationsCount() });
    },
  });
}
