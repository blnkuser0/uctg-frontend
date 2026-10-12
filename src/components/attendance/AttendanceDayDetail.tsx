"use client";

import { cn, formatClockTime, formatHours } from "@/lib/utils";
import { BREAK_LIMIT_MINUTES, DaySummary } from "@/types/timeLog";
import { STATUS_DOT, STATUS_LABEL } from "./AttendanceCalendar";

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return formatClockTime(iso);
}

export function AttendanceDayDetail({ dateKey, summary }: { dateKey: string; summary: DaySummary | undefined }) {
  const label = new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-emerald-500/6 px-4 py-3">
        <h3 className="text-sm font-semibold">{label}</h3>
        {summary && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("size-2 rounded-full", STATUS_DOT[summary.status])} />
            {STATUS_LABEL[summary.status]}
          </span>
        )}
      </div>

      {summary && summary.status === "present" && (
        <div className="grid grid-cols-2 gap-5 p-5 text-left sm:grid-cols-4 xl:grid-cols-2">
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
            <p className="text-sm font-medium text-blue-600">{formatHours(summary.workedMinutes)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Break</p>
            <p
              className={cn(
                "text-sm font-medium",
                summary.breakMinutes <= 0
                  ? ""
                  : summary.breakMinutes >= BREAK_LIMIT_MINUTES
                    ? "text-red-500"
                    : "text-orange-500"
              )}
            >
              {summary.breakMinutes > 0 ? formatHours(summary.breakMinutes) : "—"}
            </p>
          </div>
        </div>
      )}
      {summary && summary.status !== "present" && <p className="px-5 py-6 text-sm text-muted-foreground">{summary.status === "on-leave" ? "Approved time away. No work hours recorded." : summary.status === "weekend" ? "A weekend day. No work hours recorded." : summary.status === "upcoming" ? "This date is still ahead. Your record will appear here." : "No clock-in recorded for this date."}</p>}
      {!summary && <p className="px-4 py-6 text-center text-xs text-muted-foreground">No attendance record for this date.</p>}
    </section>
  );
}
