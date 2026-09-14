"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as organizationService from "@/services/organization.service";
import { UpdateOrganizationInput } from "@/types/organization";

const ORGANIZATION_KEY = ["organization"] as const;

export function useOrganization() {
  return useQuery({
    queryKey: ORGANIZATION_KEY,
    queryFn: organizationService.getOrganization,
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateOrganizationInput) => organizationService.updateOrganization(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORGANIZATION_KEY }),
  });
}
