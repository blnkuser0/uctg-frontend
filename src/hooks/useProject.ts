"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import * as projectService from "@/services/project.service";
import { UpdateProjectInput } from "@/types/project";

export function useProject(projectId: string) {
  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => projectService.getProject(projectId),
    enabled: !!projectId,
  });
}

function useInvalidateProject(projectId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.projects() });
    queryClient.invalidateQueries({ queryKey: queryKeys.allProjects() });
  };
}

export function useUpdateProject(projectId: string) {
  const invalidate = useInvalidateProject(projectId);
  return useMutation({
    mutationFn: (input: UpdateProjectInput) => projectService.updateProject(projectId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteProject(projectId: string) {
  const invalidate = useInvalidateProject(projectId);
  return useMutation({
    mutationFn: () => projectService.deleteProject(projectId),
    onSuccess: invalidate,
  });
}

export function useAddProjectMember(projectId: string) {
  const invalidate = useInvalidateProject(projectId);
  return useMutation({
    mutationFn: (userId: string) => projectService.addMember(projectId, userId),
    onSuccess: invalidate,
  });
}

export function useRemoveProjectMember(projectId: string) {
  const invalidate = useInvalidateProject(projectId);
  return useMutation({
    mutationFn: (userId: string) => projectService.removeMember(projectId, userId),
    onSuccess: invalidate,
  });
}
