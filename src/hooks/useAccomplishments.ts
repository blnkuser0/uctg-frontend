"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import * as accomplishmentService from "@/services/accomplishment.service";
import { AccomplishmentFilters, CreateAccomplishmentInput, UpdateAccomplishmentInput } from "@/types/accomplishment";

export function useMyAccomplishments(filters: AccomplishmentFilters = {}, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.accomplishmentsMine(filters),
    queryFn: () => accomplishmentService.listMyAccomplishments(filters),
    enabled,
  });
}

export function useAllAccomplishments(filters: AccomplishmentFilters = {}, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.accomplishmentsAll(filters),
    queryFn: () => accomplishmentService.listAllAccomplishments(filters),
    enabled,
  });
}

function useInvalidateAccomplishments() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.accomplishmentsAll() });
    queryClient.invalidateQueries({ queryKey: queryKeys.accomplishmentsMine() });
  };
}

export function useCreateAccomplishment() {
  const invalidate = useInvalidateAccomplishments();
  return useMutation({
    mutationFn: (input: CreateAccomplishmentInput) => accomplishmentService.createAccomplishment(input),
    onSuccess: invalidate,
  });
}

export function useUpdateAccomplishment() {
  const invalidate = useInvalidateAccomplishments();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAccomplishmentInput }) =>
      accomplishmentService.updateAccomplishment(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteAccomplishment() {
  const invalidate = useInvalidateAccomplishments();
  return useMutation({
    mutationFn: (id: string) => accomplishmentService.deleteAccomplishment(id),
    onSuccess: invalidate,
  });
}
