"use client";

import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RoleFormDialog } from "./RoleFormDialog";
import { useDeleteRole } from "@/hooks/useRoles";
import { PERMISSION_LABELS, Role } from "@/types/role";
import { Pencil, Trash2, Users } from "lucide-react";

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
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Role name</TableHead>
            <TableHead>Users</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="align-top">
                <span className="font-medium">{role.name}</span>
              </TableCell>
              <TableCell className="align-top">
                <Badge className="w-fit gap-1 bg-muted font-normal whitespace-nowrap text-muted-foreground">
                  <Users className="size-3" />
                  {role.userCount ?? 0}
                </Badge>
              </TableCell>
              <TableCell className="max-w-md align-top whitespace-normal">
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No permissions</span>
                  ) : (
                    role.permissions.map((p) => (
                      <Badge key={p} className="bg-cyan-500/15 font-normal whitespace-nowrap text-cyan-700">
                        {PERMISSION_LABELS[p]}
                      </Badge>
                    ))
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right align-top">
                <div className="flex shrink-0 justify-end gap-1.5">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
