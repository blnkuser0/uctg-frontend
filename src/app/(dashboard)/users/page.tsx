"use client";

import { useUsers } from "@/hooks/useUsers";
import { UserTable } from "@/components/users/UserTable";
import { UserFormDialog } from "@/components/users/UserFormDialog";

export default function UsersPage() {
  const { data, isLoading } = useUsers();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">Everyone in your organization, and the role they hold.</p>
        </div>
        <UserFormDialog />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="size-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
      ) : (
        <UserTable users={data ?? []} />
      )}
    </div>
  );
}
