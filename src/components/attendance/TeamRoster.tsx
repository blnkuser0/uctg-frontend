"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, formatClockTime } from "@/lib/utils";
import { TeamDayEntry } from "@/types/timeLog";
import { STATUS_DOT, STATUS_LABEL } from "./AttendanceCalendar";

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return formatClockTime(iso);
}

export function TeamRoster({ dateKey, entries, isLoading }: { dateKey: string; entries: TeamDayEntry[]; isLoading: boolean }) {
  const label = new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric" });

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="size-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold">Team — {label}</h3>
      <div className="mt-3 grid gap-2">
        {entries.map((entry) => (
          <div key={entry.userId} className="flex items-center gap-3">
            <Avatar className="size-7 shrink-0">
              <AvatarFallback className="bg-cyan-500/20 text-[10px] text-cyan-700">{initials(entry.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{entry.name}</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {entry.summary.status === "present" && (
                <span>
                  {formatTime(entry.summary.firstTimeIn)} – {formatTime(entry.summary.lastTimeOut)}
                </span>
              )}
              <span className={cn("size-2 rounded-full", STATUS_DOT[entry.summary.status])} />
              {STATUS_LABEL[entry.summary.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
