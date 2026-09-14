"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import * as taskService from "@/services/task.service";
import { UpdateTaskInput } from "@/types/task";

export function useTask(taskId: string) {
  return useQuery({
    queryKey: queryKeys.task(taskId),
    queryFn: () => taskService.getTask(taskId),
    enabled: !!taskId,
  });
}

function useInvalidateTask(taskId: string, projectId?: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.task(taskId) });
    if (projectId) queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tasks"] });
  };
}

export function useUpdateTask(taskId: string, projectId?: string) {
  const invalidate = useInvalidateTask(taskId, projectId);
  return useMutation({
    mutationFn: (input: UpdateTaskInput) => taskService.updateTask(taskId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteTask(taskId: string, projectId?: string) {
  const invalidate = useInvalidateTask(taskId, projectId);
  return useMutation({
    mutationFn: () => taskService.deleteTask(taskId),
    onSuccess: invalidate,
  });
}

export function useSubtasks(taskId: string) {
  return useQuery({
    queryKey: queryKeys.subtasks(taskId),
    queryFn: () => taskService.listSubtasks(taskId),
    enabled: !!taskId,
  });
}

export function useCreateSubtask(taskId: string, projectId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; description?: string }) => taskService.createSubtask(taskId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subtasks(taskId) });
      if (projectId) queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tasks"] });
    },
  });
}

export function useAddChecklistItem(taskId: string, projectId?: string) {
  const invalidate = useInvalidateTask(taskId, projectId);
  return useMutation({
    mutationFn: (text: string) => taskService.addChecklistItem(taskId, text),
    onSuccess: invalidate,
  });
}

export function useUpdateChecklistItem(taskId: string, projectId?: string) {
  const invalidate = useInvalidateTask(taskId, projectId);
  return useMutation({
    mutationFn: ({ itemId, updates }: { itemId: string; updates: { text?: string; isChecked?: boolean } }) =>
      taskService.updateChecklistItem(taskId, itemId, updates),
    onSuccess: invalidate,
  });
}

export function useDeleteChecklistItem(taskId: string, projectId?: string) {
  const invalidate = useInvalidateTask(taskId, projectId);
  return useMutation({
    mutationFn: (itemId: string) => taskService.deleteChecklistItem(taskId, itemId),
    onSuccess: invalidate,
  });
}

export function useAddAttachments(taskId: string, projectId?: string) {
  const invalidate = useInvalidateTask(taskId, projectId);
  return useMutation({
    mutationFn: (files: File[]) => taskService.addAttachments(taskId, files),
    onSuccess: invalidate,
  });
}

export function useRemoveAttachment(taskId: string, projectId?: string) {
  const invalidate = useInvalidateTask(taskId, projectId);
  return useMutation({
    mutationFn: (fileKey: string) => taskService.removeAttachment(taskId, fileKey),
    onSuccess: invalidate,
  });
}
