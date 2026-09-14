"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import * as stageService from "@/services/stage.service";
import { CreateStageInput, UpdateStageInput } from "@/types/stage";

export function useStages(projectId: string) {
  return useQuery({
    queryKey: queryKeys.stages(projectId),
    queryFn: () => stageService.listStages(projectId),
    enabled: !!projectId,
  });
}

function useInvalidateStages(projectId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.stages(projectId) });
}

export function useCreateStage(projectId: string) {
  const invalidate = useInvalidateStages(projectId);
  return useMutation({
    mutationFn: (input: CreateStageInput) => stageService.createStage(projectId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateStage(projectId: string) {
  const invalidate = useInvalidateStages(projectId);
  return useMutation({
    mutationFn: ({ stageId, input }: { stageId: string; input: UpdateStageInput }) =>
      stageService.updateStage(stageId, input),
    onSuccess: invalidate,
  });
}

export function useReorderStages(projectId: string) {
  const invalidate = useInvalidateStages(projectId);
  return useMutation({
    mutationFn: (orderedIds: string[]) => stageService.reorderStages(projectId, orderedIds),
    onSuccess: invalidate,
  });
}

export function useDeleteStage(projectId: string) {
  const invalidate = useInvalidateStages(projectId);
  return useMutation({
    mutationFn: ({ stageId, reassignToStageId }: { stageId: string; reassignToStageId?: string }) =>
      stageService.deleteStage(stageId, reassignToStageId),
    onSuccess: () => {
      invalidate();
      // Deleting a stage can reassign tasks into another stage — tasks need a refresh too.
    },
  });
}
