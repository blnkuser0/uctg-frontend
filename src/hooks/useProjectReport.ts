"use client";

import { useQuery } from "@tanstack/react-query";
import * as projectService from "@/services/project.service";

export function useProjectReport(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId, "report"] as const,
    queryFn: () => projectService.getProjectReport(projectId),
    enabled: !!projectId,
  });
}
