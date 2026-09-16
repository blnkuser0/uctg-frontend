"use client";

import { usePlatformOrganizations } from "@/hooks/usePlatform";
import { OrganizationList } from "@/components/platform/OrganizationList";
import { OrganizationFormDialog } from "@/components/platform/OrganizationFormDialog";

export default function PlatformOrganizationsPage() {
  const { data, isLoading } = usePlatformOrganizations();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Organizations</h1>
          <p className="text-sm text-muted-foreground">Every client workspace, plus the shared Developers org.</p>
        </div>
        <OrganizationFormDialog />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="size-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
      ) : (
        <OrganizationList organizations={data ?? []} />
      )}
    </div>
  );
}
