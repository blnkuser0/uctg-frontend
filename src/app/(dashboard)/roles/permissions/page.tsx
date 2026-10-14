"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/layout/PageHeader";
import { PermissionChecklist } from "@/components/roles/PermissionChecklist";
import { useRoles, useUpdateRole } from "@/hooks/useRoles";
import { PERMISSIONS, Permission, Role } from "@/types/role";
import { ArrowLeft } from "lucide-react";

// Grouped by feature area now that the flat list has grown — each group renders through
// PermissionChecklist unmodified, just given a filtered subset.
const PERMISSION_GROUPS: { title: string; permissions: Permission[] }[] = [
  { title: "Projects & Tasks", permissions: [PERMISSIONS.PROJECTS_MANAGE, PERMISSIONS.TASKS_MANAGE] },
  { title: "Attendance", permissions: [PERMISSIONS.ATTENDANCE_VIEW_ALL] },
  { title: "Leaves", permissions: [PERMISSIONS.LEAVES_VIEW_ALL, PERMISSIONS.LEAVES_APPROVE_HR, PERMISSIONS.LEAVES_APPROVE_ADMIN] },
  { title: "Users & Roles", permissions: [PERMISSIONS.USERS_MANAGE, PERMISSIONS.ROLES_MANAGE] },
  { title: "Accomplishments", permissions: [PERMISSIONS.ACCOMPLISHMENTS_MANAGE] },
  { title: "Organization", permissions: [PERMISSIONS.ORG_MANAGE] },
];

export default function RolePermissionsPage() {
  const searchParams = useSearchParams();
  const { data: roles, isLoading } = useRoles();
  const [manualRoleId, setManualRoleId] = useState<string | null>(null);

  // Defaults to ?roleId=, falling back to the first role — but once the person picks a
  // different role from the dropdown, that choice wins regardless of the URL param.
  const fromQuery = searchParams.get("roleId");
  const selectedRoleId =
    manualRoleId ?? (fromQuery && roles?.some((r) => r.id === fromQuery) ? fromQuery : (roles?.[0]?.id ?? ""));
  const selectedRole = (roles ?? []).find((r) => r.id === selectedRoleId);

  return (
    <div className="catalyst-page">
      <PageHeader
        title="Role Permissions"
        section="Administration / Access control"
        tone="coral"
        actions={
          <Button variant="outline" render={<Link href="/roles" />}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="size-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
      ) : (roles ?? []).length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No roles yet — create one on the Roles page first.</p>
      ) : (
        <div className="grid gap-4">
          <div className="catalyst-panel flex flex-col gap-2 p-4 sm:max-w-sm">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="role-picker">
              Role
            </label>
            <Select
              value={selectedRoleId || undefined}
              items={(roles ?? []).map((role) => ({ value: role.id, label: role.name }))}
              onValueChange={(value) => value && setManualRoleId(value)}
            >
              <SelectTrigger id="role-picker">
                <SelectValue placeholder="Select a role..." />
              </SelectTrigger>
              <SelectContent>
                {(roles ?? []).map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* key={role.id} resets the checklist's local state when the selected role changes,
              instead of syncing it via an effect. */}
          {selectedRole && <RolePermissionEditor key={selectedRole.id} role={selectedRole} />}
        </div>
      )}
    </div>
  );
}

function RolePermissionEditor({ role }: { role: Role }) {
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(role.permissions);
  const updateRole = useUpdateRole();

  function handleSave() {
    updateRole.mutate(
      { roleId: role.id, input: { permissions: selectedPermissions } },
      {
        onSuccess: () => toast.success("Permissions updated"),
        onError: (err: unknown) => {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Something went wrong. Please try again.";
          toast.error(message);
        },
      }
    );
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {PERMISSION_GROUPS.map((group) => (
          <div key={group.title} className="catalyst-panel p-4">
            <h3 className="mb-3 text-sm font-semibold">{group.title}</h3>
            <PermissionChecklist selected={selectedPermissions} onChange={setSelectedPermissions} permissions={group.permissions} />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" render={<Link href="/roles" />}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={updateRole.isPending} className="bg-cyan-600 text-white hover:bg-cyan-500">
          {updateRole.isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </>
  );
}
