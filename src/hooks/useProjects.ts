"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import * as projectService from "@/services/project.service";
import { CreateProjectInput } from "@/types/project";

export function useMyProjects() {
  return useQuery({
    queryKey: queryKeys.projects(),
    queryFn: projectService.listMyProjects,
  });
}

export function useAllProjects(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.allProjects(),
    queryFn: projectService.listAllProjects,
    enabled,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectService.createProject(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects() });
      queryClient.invalidateQueries({ queryKey: queryKeys.allProjects() });
    },
  });
}
