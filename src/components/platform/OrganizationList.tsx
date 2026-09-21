"use client";

import { Badge } from "@/components/ui/badge";
import { PlatformOrganization } from "@/types/platform";

export function OrganizationList({ organizations }: { organizations: PlatformOrganization[] }) {
  if (organizations.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No organizations yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {organizations.map((org) => (
        <div key={org._id} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-semibold">{org.name}</h3>
              <p className="truncate text-xs text-muted-foreground">/{org.slug}</p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              {org.type === "internal" && (
                <Badge className="bg-cyan-500/15 font-normal text-cyan-700">Developers org</Badge>
              )}
              {org.status !== "active" && (
                <Badge className="bg-muted font-normal text-muted-foreground">{org.status}</Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
