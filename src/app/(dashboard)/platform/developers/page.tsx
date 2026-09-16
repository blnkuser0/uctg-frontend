"use client";

import { usePlatformDevelopers } from "@/hooks/usePlatform";
import { DeveloperList } from "@/components/platform/DeveloperList";
import { DeveloperFormDialog } from "@/components/platform/DeveloperFormDialog";

export default function PlatformDevelopersPage() {
  const { data, isLoading } = usePlatformDevelopers();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Developers</h1>
          <p className="text-sm text-muted-foreground">
            Everyone in the shared Developers organization — assign them to client projects from the Projects tab.
          </p>
        </div>
        <DeveloperFormDialog />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="size-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
      ) : (
        <DeveloperList developers={data ?? []} />
      )}
    </div>
  );
}
