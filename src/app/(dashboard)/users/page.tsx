"use client";

import { useMemo, useState } from "react";
import { ListFilter, Search } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { useRoles } from "@/hooks/useRoles";
import { UserTable } from "@/components/users/UserTable";
import { UserFormDialog } from "@/components/users/UserFormDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";

export default function UsersPage() {
  const { data, isLoading } = useUsers();
  const { data: roles } = useRoles();
  const [search, setSearch] = useState("");
  const [roleId, setRoleId] = useState("all");
  const [status, setStatus] = useState<"all" | "active" | "deactivated">("all");

  const visibleUsers = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return (data ?? []).filter((user) => {
      const matchesTerm = !term || user.name.toLocaleLowerCase().includes(term) || user.email.toLocaleLowerCase().includes(term);
      const matchesRole = roleId === "all" || user.role.id === roleId;
      const isActive = user.isActive !== false;
      const matchesStatus = status === "all" || (status === "active" ? isActive : !isActive);
      return matchesTerm && matchesRole && matchesStatus;
    });
  }, [data, search, roleId, status]);

  return (
    <div className="catalyst-page max-w-5xl">
      <PageHeader title="Employee Management" section="Administration / Directory" tone="coral" actions={<UserFormDialog />} />

      <div className="catalyst-panel flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
            placeholder="Search by name or email"
            aria-label="Search users"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <ListFilter className="size-4 shrink-0" />
          <select
            value={roleId}
            onChange={(event) => setRoleId(event.target.value)}
            aria-label="Filter by role"
            className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All roles</option>
            {(roles ?? []).map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </label>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as typeof status)}
          aria-label="Filter by status"
          className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="deactivated">Deactivated</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
          {[0, 1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse bg-card" />)}
        </div>
      ) : (
        <UserTable users={visibleUsers} emptyMessage={data && data.length > 0 ? "No users match your search." : "No users yet."} />
      )}
    </div>
  );
}
