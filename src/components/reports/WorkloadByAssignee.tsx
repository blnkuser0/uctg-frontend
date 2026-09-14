"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ProjectReportWorkload } from "@/types/report";
import { User } from "@/types/user";

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function WorkloadByAssignee({ workload, users }: { workload: ProjectReportWorkload[]; users: User[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">Workload</h2>

      {workload.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">No tasks assigned yet.</p>
      ) : (
        <div className="mt-3 grid gap-3">
          {workload.map((entry) => {
            const user = users.find((u) => u.id === entry.userId);
            const percent = entry.assigned > 0 ? Math.round((entry.completed / entry.assigned) * 100) : 0;
            return (
              <div key={entry.userId} className="flex items-center gap-3">
                <Avatar className="size-7 shrink-0">
                  <AvatarFallback className="bg-cyan-500/20 text-[10px] text-cyan-700">
                    {initials(user?.name ?? "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate font-medium">{user?.name ?? "Unknown"}</span>
                    <span className="text-muted-foreground">
                      {entry.completed}/{entry.assigned}
                    </span>
                  </div>
                  <Progress value={percent} className="mt-1 h-1.5" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
