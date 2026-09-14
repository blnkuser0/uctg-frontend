"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import * as timeEntryService from "@/services/timeEntry.service";
import { CreateManualTimeEntryInput } from "@/types/timeEntry";

export function useTimeEntries(taskId: string) {
  return useQuery({
    queryKey: queryKeys.timeEntries(taskId),
    queryFn: () => timeEntryService.listTimeEntries(taskId),
    enabled: !!taskId,
  });
}

function useInvalidateTimeEntries(taskId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries(taskId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.task(taskId) });
  };
}

export function useStartTimer(taskId: string) {
  const invalidate = useInvalidateTimeEntries(taskId);
  return useMutation({
    mutationFn: () => timeEntryService.startTimer(taskId),
    onSuccess: invalidate,
  });
}

export function useStopTimer(taskId: string) {
  const invalidate = useInvalidateTimeEntries(taskId);
  return useMutation({
    mutationFn: () => timeEntryService.stopTimer(taskId),
    onSuccess: invalidate,
  });
}

export function useCreateManualEntry(taskId: string) {
  const invalidate = useInvalidateTimeEntries(taskId);
  return useMutation({
    mutationFn: (input: CreateManualTimeEntryInput) => timeEntryService.createManualEntry(taskId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteTimeEntry(taskId: string) {
  const invalidate = useInvalidateTimeEntries(taskId);
  return useMutation({
    mutationFn: (entryId: string) => timeEntryService.deleteTimeEntry(entryId),
    onSuccess: invalidate,
  });
}
