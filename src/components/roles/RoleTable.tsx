"use client";

import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleFormDialog } from "./RoleFormDialog";
import { useDeleteRole } from "@/hooks/useRoles";
import { PERMISSION_LABELS, Role } from "@/types/role";
import { Pencil, Trash2 } from "lucide-react";

export function RoleTable({ roles }: { roles: Role[] }) {
  const deleteRole = useDeleteRole();

  function handleDelete(role: Role) {
    if (role.userCount && role.userCount > 0) {
      toast.error(`${role.userCount} user(s) still have this role — reassign them first`);
      return;
    }
    deleteRole.mutate(role.id, {
      onSuccess: () => toast.success("Role deleted"),
      onError: () => toast.error("Could not delete this role."),
    });
  }

  if (roles.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No roles yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {roles.map((role) => (
        <div key={role.id} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{role.name}</h3>
                <Badge className="bg-muted font-normal text-muted-foreground">
                  {role.userCount ?? 0} {role.userCount === 1 ? "user" : "users"}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {role.permissions.length === 0 ? (
                  <span className="text-xs text-muted-foreground">No permissions</span>
                ) : (
                  role.permissions.map((p) => (
                    <Badge key={p} className="bg-cyan-500/15 font-normal text-cyan-700">
                      {PERMISSION_LABELS[p]}
                    </Badge>
                  ))
                )}
              </div>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <RoleFormDialog
                role={role}
                trigger={
                  <Button size="icon-sm" variant="outline" aria-label="Edit role">
                    <Pencil className="size-3.5" />
                  </Button>
                }
              />
              <Button size="icon-sm" variant="outline" onClick={() => handleDelete(role)} aria-label="Delete role">
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
