"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import * as taskService from "@/services/task.service";
import { CreateTaskInput, TaskListFilters } from "@/types/task";

export function useTasks(projectId: string, filters: TaskListFilters = {}) {
  return useQuery({
    queryKey: queryKeys.tasks(projectId, filters as Record<string, string | undefined>),
    queryFn: () => taskService.listTasks(projectId, filters),
    enabled: !!projectId,
  });
}

function useInvalidateTasks(projectId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tasks"] });
}

export function useCreateTask(projectId: string) {
  const invalidate = useInvalidateTasks(projectId);
  return useMutation({
    mutationFn: (input: CreateTaskInput) => taskService.createTask(projectId, input),
    onSuccess: invalidate,
  });
}

export function useMoveTask(projectId: string) {
  const invalidate = useInvalidateTasks(projectId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, stageId, order }: { taskId: string; stageId: string; order: number }) =>
      taskService.moveTask(taskId, stageId, order),
    onSuccess: (task) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: queryKeys.task(task._id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.myTasks() });
    },
  });
}
