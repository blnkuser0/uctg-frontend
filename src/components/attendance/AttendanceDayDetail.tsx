"use client";

import { cn, formatClockTime } from "@/lib/utils";
import { DaySummary } from "@/types/timeLog";
import { STATUS_DOT, STATUS_LABEL } from "./AttendanceCalendar";

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return formatClockTime(iso);
}

function formatHours(minutes: number): string {
  if (minutes <= 0) return "0h";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function AttendanceDayDetail({ dateKey, summary }: { dateKey: string; summary: DaySummary | undefined }) {
  const label = new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="catalyst-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-emerald-500/6 px-4 py-3">
        <h3 className="text-sm font-semibold">{label}</h3>
        {summary && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("size-2 rounded-full", STATUS_DOT[summary.status])} />
            {STATUS_LABEL[summary.status]}
          </span>
        )}
      </div>

      {summary && summary.status === "present" && (
        <div className="grid grid-cols-3 divide-x divide-border p-4 text-center">
          <div>
            <p className="text-[11px] text-muted-foreground">Time in</p>
            <p className="text-sm font-medium">{formatTime(summary.firstTimeIn)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Time out</p>
            <p className="text-sm font-medium">{formatTime(summary.lastTimeOut)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Worked</p>
            <p className="text-sm font-medium">{formatHours(summary.workedMinutes)}</p>
          </div>
        </div>
      )}
      {!summary && <p className="px-4 py-6 text-center text-xs text-muted-foreground">No attendance record for this date.</p>}
    </section>
  );
}
