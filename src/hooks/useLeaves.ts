"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import * as leaveService from "@/services/leave.service";
import { CreateLeaveInput, LeaveDecisionInput } from "@/types/leave";

export function useAllLeaves(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.leavesAll(),
    queryFn: leaveService.listAllLeaves,
    enabled,
  });
}

export function useMyLeaves() {
  return useQuery({
    queryKey: queryKeys.leavesMine(),
    queryFn: leaveService.listMyLeaves,
  });
}

function useInvalidateLeaves() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.leavesAll() });
    queryClient.invalidateQueries({ queryKey: queryKeys.leavesMine() });
  };
}

export function useCreateLeave() {
  const invalidate = useInvalidateLeaves();
  return useMutation({
    mutationFn: (input: CreateLeaveInput) => leaveService.createLeave(input),
    onSuccess: invalidate,
  });
}

export function useHrDecision() {
  const invalidate = useInvalidateLeaves();
  return useMutation({
    mutationFn: ({ leaveId, input }: { leaveId: string; input: LeaveDecisionInput }) =>
      leaveService.setHrDecision(leaveId, input),
    onSuccess: invalidate,
  });
}

export function useAdminDecision() {
  const invalidate = useInvalidateLeaves();
  return useMutation({
    mutationFn: ({ leaveId, input }: { leaveId: string; input: LeaveDecisionInput }) =>
      leaveService.setAdminDecision(leaveId, input),
    onSuccess: invalidate,
  });
}

export function useCancelLeave() {
  const invalidate = useInvalidateLeaves();
  return useMutation({
    mutationFn: (leaveId: string) => leaveService.cancelLeave(leaveId),
    onSuccess: invalidate,
  });
}
