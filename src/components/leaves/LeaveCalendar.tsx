"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { cn, toPhDateKey } from "@/lib/utils";
import { Leave } from "@/types/leave";

interface DayLeave {
  employeeName: string;
  status: "pending" | "approved";
  reason: string;
}

function employeeName(leave: Leave): string {
  return typeof leave.userId === "string" ? "You" : leave.userId.name;
}

function expandByDay(leaves: Leave[]): Map<string, DayLeave[]> {
  const byDay = new Map<string, DayLeave[]>();
  for (const leave of leaves) {
    if (leave.status === "rejected") continue;
    let cursor = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    while (cursor <= end) {
      const key = toPhDateKey(cursor);
      const entry: DayLeave = { employeeName: employeeName(leave), status: leave.status as "pending" | "approved", reason: leave.reason };
      const existing = byDay.get(key);
      if (existing) existing.push(entry);
      else byDay.set(key, [entry]);
      cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    }
  }
  return byDay;
}

export function LeaveCalendar({ leaves }: { leaves: Leave[] }) {
  const todayPhKey = toPhDateKey(new Date());
  const [todayYear, todayMonth] = todayPhKey.split("-").map(Number);
  const [year, setYear] = useState(todayYear);
  const [month, setMonth] = useState(todayMonth);
  const [selectedDateKey, setSelectedDateKey] = useState(todayPhKey);

  const byDay = expandByDay(leaves);
  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const selectedEntries = byDay.get(selectedDateKey) ?? [];

  function shiftMonth(delta: number) {
    const next = new Date(year, month - 1 + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth() + 1);
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon-sm" onClick={() => shiftMonth(-1)} aria-label="Previous month">
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-semibold">{monthLabel}</span>
          <Button variant="ghost" size="icon-sm" onClick={() => shiftMonth(1)} aria-label="Next month">
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="mt-3">
          <MonthGrid
            year={year}
            month={month}
            selectedDateKey={selectedDateKey}
            onSelectDate={setSelectedDateKey}
            renderDay={(_date, dateKey) => {
              const entries = byDay.get(dateKey) ?? [];
              const hasApproved = entries.some((e) => e.status === "approved");
              const hasPending = entries.some((e) => e.status === "pending");
              return (
                <span className="flex gap-0.5">
                  {hasApproved && <span className="size-1.5 rounded-full bg-emerald-500" />}
                  {hasPending && <span className="size-1.5 rounded-full bg-amber-500" />}
                </span>
              );
            }}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-3 border-t border-border pt-3">
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-500" />
            Approved
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="size-2 rounded-full bg-amber-500" />
            Pending
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold">
          {new Date(`${selectedDateKey}T00:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </h3>
        {selectedEntries.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No leave scheduled.</p>
        ) : (
          <div className="mt-2 grid gap-2">
            {selectedEntries.map((entry, i) => (
              <div key={i} className="flex items-center justify-between gap-2 rounded-lg border border-border p-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{entry.employeeName}</p>
                  <p className="truncate text-xs text-muted-foreground">{entry.reason}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                    entry.status === "approved" ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600"
                  )}
                >
                  {entry.status === "approved" ? "Approved" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
