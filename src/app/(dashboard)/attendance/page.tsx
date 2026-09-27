"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PersonalAttendance } from "@/components/attendance/PersonalAttendance";
import { STATUS_DOT, STATUS_LABEL } from "@/components/attendance/AttendanceCalendar";
import { TeamAttendanceTable } from "@/components/attendance/TeamAttendanceTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTeamAttendance, useTeamPeriodSummary } from "@/hooks/useTimeLog";
import { useAuth } from "@/providers/AuthProvider";
import { toDateKey, toPhDateKey } from "@/lib/utils";
import { PERMISSIONS } from "@/types/role";
import { DayAttendanceStatus } from "@/types/timeLog";

const COUNT_ORDER: DayAttendanceStatus[] = ["present", "absent", "on-leave", "weekend"];

function shiftDay(dateKey: string, delta: number): string {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + delta);
  return toDateKey(date);
}

// Team monitoring — gated by attendance.view_all. Each person's OWN calendar (hours per day, week
// and cut-off totals) lives on their Timeproof page; here a manager sees everyone at once.
export default function AttendancePage() {
  const { user } = useAuth();
  const canView = user?.role.permissions.includes(PERMISSIONS.ATTENDANCE_VIEW_ALL) ?? false;

  const todayPhKey = toPhDateKey(new Date());
  const [dateKey, setDateKey] = useState(todayPhKey);
  const [viewing, setViewing] = useState<{ userId: string; name: string } | null>(null);

  const dayAttendance = useTeamAttendance(dateKey, canView);
  const periodSummary = useTeamPeriodSummary(dateKey, canView);

  if (!canView) {
    return (
      <div className="catalyst-page">
        <PageHeader title="Attendance" section="Operations / Team records" tone="green" />
        <p className="py-10 text-center text-sm text-muted-foreground">
          You don&apos;t have access to this page. Ask an admin for the &ldquo;View everyone&apos;s attendance &amp; hours&rdquo; permission.
        </p>
      </div>
    );
  }

  const dayEntries = dayAttendance.data ?? [];
  const counts = COUNT_ORDER.map((status) => ({ status, count: dayEntries.filter((e) => e.summary.status === status).length }));
  const dayLabel = new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="catalyst-page min-w-0">
      <PageHeader title="Attendance" section="Operations / Team records" tone="green" />

      <div className="catalyst-panel flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon-sm" onClick={() => setDateKey(shiftDay(dateKey, -1))} aria-label="Previous day">
            <ChevronLeft className="size-4" />
          </Button>
          <input
            type="date"
            value={dateKey}
            max={todayPhKey}
            onChange={(event) => event.target.value && setDateKey(event.target.value)}
            aria-label="Attendance date"
            className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setDateKey(shiftDay(dateKey, 1))}
            disabled={dateKey >= todayPhKey}
            aria-label="Next day"
          >
            <ChevronRight className="size-4" />
          </Button>
          {dateKey !== todayPhKey && (
            <Button variant="outline" size="sm" onClick={() => setDateKey(todayPhKey)}>
              Today
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {counts.map(({ status, count }) => (
            <span key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`size-2 rounded-full ${STATUS_DOT[status]}`} />
              {STATUS_LABEL[status]} <span className="font-semibold text-foreground tabular-nums">{count}</span>
            </span>
          ))}
        </div>
      </div>
      <p className="-mt-2 text-xs text-muted-foreground">{dayLabel}</p>

      <TeamAttendanceTable
        dayEntries={dayEntries}
        periodEntries={periodSummary.data ?? []}
        isLoading={dayAttendance.isLoading}
        onViewCalendar={(userId, name) => setViewing({ userId, name })}
      />

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{viewing?.name}&apos;s attendance</DialogTitle>
            <DialogDescription>Hours per day, plus week and cut-off totals.</DialogDescription>
          </DialogHeader>
          {viewing && <PersonalAttendance key={viewing.userId} userId={viewing.userId} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
