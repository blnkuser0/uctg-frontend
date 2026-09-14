"use client";

import { useRoles } from "@/hooks/useRoles";
import { RoleTable } from "@/components/roles/RoleTable";
import { RoleFormDialog } from "@/components/roles/RoleFormDialog";

export default function RolesPage() {
  const { data, isLoading } = useRoles();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Roles</h1>
          <p className="text-sm text-muted-foreground">
            Create roles and pick exactly what each one can do — no fixed role names.
          </p>
        </div>
        <RoleFormDialog />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="size-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      ) : (
        <RoleTable roles={data ?? []} />
      )}
    </div>
  );
}
