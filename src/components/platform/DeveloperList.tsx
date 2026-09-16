"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Developer } from "@/types/platform";

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function DeveloperList({ developers }: { developers: Developer[] }) {
  if (developers.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No developers yet.</p>;
  }

  return (
    <div className="grid gap-3">
      {developers.map((dev) => (
        <div key={dev.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <Avatar className="size-9 shrink-0">
            <AvatarFallback className="bg-cyan-500/20 text-xs text-cyan-700">{initials(dev.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{dev.name}</h3>
            <p className="truncate text-xs text-muted-foreground">{dev.email}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
