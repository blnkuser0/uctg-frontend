"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import * as labelService from "@/services/label.service";
import { CreateLabelInput, UpdateLabelInput } from "@/types/label";

export function useLabels(projectId: string) {
  return useQuery({
    queryKey: queryKeys.labels(projectId),
    queryFn: () => labelService.listLabels(projectId),
    enabled: !!projectId,
  });
}

function useInvalidateLabels(projectId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.labels(projectId) });
}

export function useCreateLabel(projectId: string) {
  const invalidate = useInvalidateLabels(projectId);
  return useMutation({
    mutationFn: (input: CreateLabelInput) => labelService.createLabel(projectId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateLabel(projectId: string) {
  const invalidate = useInvalidateLabels(projectId);
  return useMutation({
    mutationFn: ({ labelId, input }: { labelId: string; input: UpdateLabelInput }) =>
      labelService.updateLabel(labelId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteLabel(projectId: string) {
  const invalidate = useInvalidateLabels(projectId);
  return useMutation({
    mutationFn: (labelId: string) => labelService.deleteLabel(labelId),
    onSuccess: invalidate,
  });
}
