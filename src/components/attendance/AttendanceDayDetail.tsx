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
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{label}</h3>
        {summary && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("size-2 rounded-full", STATUS_DOT[summary.status])} />
            {STATUS_LABEL[summary.status]}
          </span>
        )}
      </div>

      {summary && summary.status === "present" && (
        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
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
    </div>
  );
}
