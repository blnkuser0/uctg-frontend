"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccomplishmentTable } from "@/components/accomplishments/AccomplishmentTable";
import { LogAccomplishmentDialog } from "@/components/accomplishments/LogAccomplishmentDialog";
import { useAllAccomplishments, useMyAccomplishments } from "@/hooks/useAccomplishments";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/providers/AuthProvider";
import { PERMISSIONS } from "@/types/role";

export default function AccomplishmentsPage() {
  const { user } = useAuth();
  const canManage = user?.role.permissions.includes(PERMISSIONS.ACCOMPLISHMENTS_MANAGE) ?? false;

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [userId, setUserId] = useState("all");

  const { data: users } = useUsers();
  const teamEntries = useAllAccomplishments(
    { from: from || undefined, to: to || undefined, userId: userId === "all" ? undefined : userId },
    canManage
  );
  const myEntries = useMyAccomplishments({}, canManage);

  if (!canManage) {
    return (
      <div className="catalyst-page max-w-5xl">
        <PageHeader title="Daily accomplishments" section="Operations / Task log" tone="green" />
        <p className="py-10 text-center text-sm text-muted-foreground">
          You don&apos;t have access to this page. Ask an admin for the &ldquo;Log and view daily accomplishments&rdquo; permission.
        </p>
      </div>
    );
  }

  return (
    <div className="catalyst-page max-w-5xl">
      <PageHeader title="Daily accomplishments" section="Operations / Task log" tone="green" actions={<LogAccomplishmentDialog />} />

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
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              aria-label="Filter by employee"
              className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">Everyone</option>
              {(users ?? []).map((teamUser) => (
                <option key={teamUser.id} value={teamUser.id}>
                  {teamUser.name}
                </option>
              ))}
            </select>
          </div>
          <AccomplishmentTable
            entries={teamEntries.data ?? []}
            currentUserId={user?.id ?? ""}
            showEmployeeColumn
            emptyMessage="No accomplishments logged for this filter yet."
          />
        </TabsContent>

        <TabsContent value="mine" className="mt-4">
          <AccomplishmentTable
            entries={myEntries.data ?? []}
            currentUserId={user?.id ?? ""}
            showEmployeeColumn={false}
            emptyMessage="You haven't logged anything yet — add today's first."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
