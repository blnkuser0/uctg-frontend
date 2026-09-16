"use client";

import { useUsers } from "@/hooks/useUsers";
import { UserTable } from "@/components/users/UserTable";
import { UserFormDialog } from "@/components/users/UserFormDialog";
import { PageHeader } from "@/components/layout/PageHeader";

export default function UsersPage() {
  const { data, isLoading } = useUsers();

  return (
    <div className="catalyst-page max-w-5xl">
      <PageHeader title="Account provisioning" section="Administration / Directory" tone="coral" actions={<UserFormDialog />} />

      {isLoading ? (
        <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
          {[0, 1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse bg-card" />)}
        </div>
      ) : (
        <UserTable users={data ?? []} />
      )}
    </div>
  );
}
