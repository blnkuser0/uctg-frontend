"use client";

import { CalendarRange, Clock } from "lucide-react";
import { PeriodStats, PeriodSummary } from "@/types/timeLog";
import { formatHours } from "@/lib/utils";

function formatRange(stats: PeriodStats): string {
  const fmt = (key: string) =>
    new Date(`${key}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${fmt(stats.from)} – ${fmt(stats.to)}`;
}

function StatCard({ title, stats }: { title: string; stats: PeriodStats | undefined }) {
  return (
    <div className="min-w-0 flex-1 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold">{title}</h4>
        {stats && <span className="text-[11px] text-muted-foreground">{formatRange(stats)}</span>}
      </div>
      <div className="mt-3 grid grid-cols-2 divide-x divide-border text-center">
        <div>
          <p className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="size-3" />
            Total hours
          </p>
          <p className="text-lg font-semibold">{stats ? formatHours(stats.totalMinutes) : "—"}</p>
        </div>
        <div>
          <p className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
            <CalendarRange className="size-3" />
            Days present
          </p>
          <p className="text-lg font-semibold">{stats ? stats.daysPresent : "—"}</p>
        </div>
      </div>
    </div>
  );
}

// Week (Mon–Sun) and payroll cut-off (1st–15th / 16th–end of month) totals for whoever's calendar
// is on screen, anchored to the currently selected date.
export function PeriodSummaryCards({ summary }: { summary: PeriodSummary | undefined }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <StatCard title="Week" stats={summary?.week} />
      <StatCard title="Cut-off" stats={summary?.cutoff} />
    </div>
  );
}
