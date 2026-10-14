"use client";

import Link from "next/link";
import { useRoles } from "@/hooks/useRoles";
import { RoleTable } from "@/components/roles/RoleTable";
import { RoleFormDialog } from "@/components/roles/RoleFormDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default function RolesPage() {
  const { data, isLoading } = useRoles();

  return (
    <div className="catalyst-page">
      <PageHeader
        title="Roles Management"
        section="Administration / Access control"
        tone="coral"
        actions={
          <>
            <Button variant="outline" render={<Link href="/roles/permissions" />}>
              <ShieldCheck className="size-4" />
              Permissions
            </Button>
            <RoleFormDialog />
          </>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="size-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
      ) : (
        <RoleTable roles={data ?? []} />
      )}
    </div>
  );
}
