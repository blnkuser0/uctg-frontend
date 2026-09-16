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
    <section className="catalyst-panel min-w-0 overflow-hidden">
      <div className="border-b border-border bg-sky-500/6 px-4 py-3"><h3 className="text-sm font-semibold">Team — {label}</h3></div>
      <div className="divide-y divide-border">
        {entries.map((entry) => (
          <div key={entry.userId} className="flex min-w-0 items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
            <Avatar className="size-7 shrink-0">
              <AvatarFallback className="bg-cyan-500/20 text-[10px] text-cyan-700">{initials(entry.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{entry.name}</p>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
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
        {entries.length === 0 && <p className="px-4 py-8 text-center text-xs text-muted-foreground">No team attendance records for this date.</p>}
      </div>
    </section>
  );
}
