"use client";

import { formatClockTime } from "@/lib/utils";
import { TimeLog, TimeLogType } from "@/types/timeLog";

const TYPE_LABEL: Record<TimeLogType, string> = {
  "time-in": "Timed in",
  "time-out": "Timed out",
  "break-in": "Break started",
  "break-out": "Break ended",
  "lunch-in": "Lunch started",
  "lunch-out": "Lunch ended",
};

export function TodayLogList({ logs }: { logs: TimeLog[] }) {
  if (logs.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No activity recorded yet today.</p>;
  }

  return (
    <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
      {[...logs].reverse().map((log) => (
        <li key={log._id} className="flex items-center justify-between px-4 py-3 text-sm">
          <span className="font-medium">{TYPE_LABEL[log.type]}</span>
          <span className="text-muted-foreground">{formatClockTime(log.timestamp)}</span>
        </li>
      ))}
    </ul>
  );
}
