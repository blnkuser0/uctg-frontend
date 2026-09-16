"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import * as platformService from "@/services/platform.service";
import { CreateOrganizationInput, CreatePlatformUserInput } from "@/types/platform";

export function usePlatformOrganizations(enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.platformOrganizations(),
    queryFn: platformService.listOrganizations,
    enabled,
  });
}

export function usePlatformDevelopers(enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.platformDevelopers(),
    queryFn: platformService.listDevelopers,
    enabled,
  });
}

export function usePlatformProjects(enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.platformProjects(),
    queryFn: platformService.listAllProjects,
    enabled,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrganizationInput) => platformService.createOrganization(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.platformOrganizations() }),
  });
}

export function useCreatePlatformUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlatformUserInput) => platformService.createPlatformUser(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.platformDevelopers() }),
  });
}

export function useAssignDeveloper() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      platformService.assignDeveloper(projectId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.platformProjects() }),
  });
}

export function useUnassignDeveloper() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      platformService.unassignDeveloper(projectId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.platformProjects() }),
  });
}
