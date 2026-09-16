"use client";

import { usePlatformOrganizations, usePlatformProjects } from "@/hooks/usePlatform";
import { ProjectOversightList } from "@/components/platform/ProjectOversightList";

export default function PlatformProjectsPage() {
  const { data: projects, isLoading: isLoadingProjects } = usePlatformProjects();
  const { data: organizations, isLoading: isLoadingOrgs } = usePlatformOrganizations();
  const isLoading = isLoadingProjects || isLoadingOrgs;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-lg font-semibold">Projects</h1>
        <p className="text-sm text-muted-foreground">
          Every project across every client organization. Assign developers here to connect them to a specific project.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="size-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
      ) : (
        <ProjectOversightList projects={projects ?? []} organizations={organizations ?? []} />
      )}
    </div>
  );
}
