"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn, formatClockTime, formatHours } from "@/lib/utils";
import { TeamDayEntry, TeamPeriodEntry } from "@/types/timeLog";
import { CalendarSearch } from "lucide-react";
import { STATUS_DOT, STATUS_LABEL } from "./AttendanceCalendar";

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function formatTime(iso: string | null): string {
  return iso ? formatClockTime(iso) : "—";
}

// Every active employee in one table: who came in (and who didn't) on the chosen day, their
// time in/out, and their hours + days worked for that day's week and payroll cut-off.
export function TeamAttendanceTable({
  dayEntries,
  periodEntries,
  isLoading,
  onViewCalendar,
}: {
  dayEntries: TeamDayEntry[];
  periodEntries: TeamPeriodEntry[];
  isLoading: boolean;
  onViewCalendar: (userId: string, name: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="size-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  const periodByUser = new Map(periodEntries.map((entry) => [entry.userId, entry.summary]));
  const first = periodEntries[0]?.summary;

  return (
    <section className="catalyst-panel min-w-0 overflow-hidden">
      <div className="border-b border-border bg-sky-500/6 px-4 py-3">
        <h3 className="text-sm font-semibold">All employees</h3>
        {first && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Week {first.week.from} → {first.week.to} · Cut-off {first.cutoff.from} → {first.cutoff.to}
          </p>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Employee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Time in – out</TableHead>
            <TableHead className="text-right">Week hours</TableHead>
            <TableHead className="text-right">Cut-off hours</TableHead>
            <TableHead className="text-right">Cut-off days</TableHead>
            <TableHead className="text-right">Calendar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dayEntries.map((entry) => {
            const period = periodByUser.get(entry.userId);
            return (
              <TableRow key={entry.userId}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-7 shrink-0">
                      <AvatarFallback className="bg-cyan-500/20 text-[10px] text-cyan-700">{initials(entry.name)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{entry.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={cn("size-2 rounded-full", STATUS_DOT[entry.summary.status])} />
                    {STATUS_LABEL[entry.summary.status]}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {entry.summary.status === "present"
                    ? `${formatTime(entry.summary.firstTimeIn)} – ${formatTime(entry.summary.lastTimeOut)}`
                    : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">{period ? formatHours(period.week.totalMinutes) : "—"}</TableCell>
                <TableCell className="text-right tabular-nums">{period ? formatHours(period.cutoff.totalMinutes) : "—"}</TableCell>
                <TableCell className="text-right tabular-nums">{period ? period.cutoff.daysPresent : "—"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => onViewCalendar(entry.userId, entry.name)}
                    aria-label={`View ${entry.name}'s attendance calendar`}
                    title="View calendar"
                  >
                    <CalendarSearch className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {dayEntries.length === 0 && <p className="px-4 py-8 text-center text-xs text-muted-foreground">No employees to show.</p>}
    </section>
  );
}
