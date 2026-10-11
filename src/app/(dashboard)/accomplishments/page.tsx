"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccomplishmentTable } from "@/components/accomplishments/AccomplishmentTable";
import { AccomplishmentComposer } from "@/components/accomplishments/AccomplishmentComposer";
import { useAllAccomplishments, useMyAccomplishments } from "@/hooks/useAccomplishments";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/providers/AuthProvider";
import { PERMISSIONS } from "@/types/role";

export default function AccomplishmentsPage() {
  const { user } = useAuth();
  const canManage = user?.role.permissions.includes(PERMISSIONS.ACCOMPLISHMENTS_MANAGE) ?? false;

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [roleId, setRoleId] = useState("all");

  const { data: users } = useUsers();
  const teamEntries = useAllAccomplishments({ from: from || undefined, to: to || undefined }, canManage);
  const myEntries = useMyAccomplishments({}, canManage);

  // Distinct roles among the org's users, for the "filter by role" dropdown below.
  const roles = useMemo(() => {
    const byId = new Map<string, string>();
    for (const teamUser of users ?? []) byId.set(teamUser.role.id, teamUser.role.name ?? "No role");
    return Array.from(byId, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);

  const teamEntriesForRole = useMemo(() => {
    const entries = teamEntries.data ?? [];
    if (roleId === "all") return entries;
    return entries.filter((entry) => typeof entry.userId !== "string" && entry.userId.roleId._id === roleId);
  }, [teamEntries.data, roleId]);

  if (!canManage) {
    return (
      <div className="catalyst-page max-w-5xl">
        <PageHeader title="Daily Progress" section="Operations / Task log" tone="green" />
        <p className="py-10 text-center text-sm text-muted-foreground">
          You don&apos;t have access to this page. Ask an admin for the &ldquo;Log and view daily progress reports&rdquo; permission.
        </p>
      </div>
    );
  }

  return (
    <div className="catalyst-page max-w-5xl">
      <PageHeader title="Daily Progress" section="Operations / Task log" tone="green" />

      <div className="mb-4">
        <AccomplishmentComposer />
      </div>

      <Tabs defaultValue="team">
        <TabsList>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="mine">Mine</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="mt-4 grid gap-3">
          <div className="catalyst-panel flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              From
              <input
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              To
              <input
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <select
              value={roleId}
              onChange={(event) => setRoleId(event.target.value)}
              aria-label="Filter by role"
              className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">Everyone</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <AccomplishmentTable
            entries={teamEntriesForRole}
            currentUserId={user?.id ?? ""}
            currentUserRoleName={user?.role.name ?? null}
            showEmployeeColumn
            emptyMessage="No accomplishments logged for this filter yet."
          />
        </TabsContent>

        <TabsContent value="mine" className="mt-4">
          <AccomplishmentTable
            entries={myEntries.data ?? []}
            currentUserId={user?.id ?? ""}
            currentUserRoleName={user?.role.name ?? null}
            showEmployeeColumn={false}
            emptyMessage="You haven't logged anything yet — add today's first."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
