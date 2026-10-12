"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PersonalAttendance } from "@/components/attendance/PersonalAttendance";
import { STATUS_DOT, STATUS_LABEL } from "@/components/attendance/AttendanceCalendar";
import { TeamAttendanceTable } from "@/components/attendance/TeamAttendanceTable";
import { OperationsHeader, OperationsStat, OperationsState } from "@/components/layout/OperationsUI";
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

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const todayPhKey = toPhDateKey(new Date());
  const [dateKey, setDateKey] = useState(todayPhKey);
  const [viewing, setViewing] = useState<{ userId: string; name: string } | null>(null);

  const dayAttendance = useTeamAttendance(dateKey, canView);
  const periodSummary = useTeamPeriodSummary(dateKey, canView);

  if (!canView) {
    return (
      <div className="catalyst-page">
        <OperationsHeader title="Attendance" description="A clear picture of your team&apos;s workday. Review daily records and explore individual hours." />
        <p className="py-10 text-center text-sm text-muted-foreground">
          You don&apos;t have access to this page. Ask an admin for the &ldquo;View everyone&apos;s attendance &amp; hours&rdquo; permission.
        </p>
      </div>
    );
  }

  const dayEntries = dayAttendance.data ?? [];
  const filteredEntries = dayEntries.filter((entry) => entry.name.toLowerCase().includes(search.trim().toLowerCase()) && (status === "all" || entry.summary.status === status));
  const counts = COUNT_ORDER.map((status) => ({ status, count: dayEntries.filter((e) => e.summary.status === status).length }));
  const dayLabel = new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 p-4 sm:p-6 xl:p-8">
      <OperationsHeader title="Attendance" description="A clear picture of your team&apos;s workday. Review daily records and explore individual hours." />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{counts.map(({ status, count }) => <OperationsStat key={status} label={STATUS_LABEL[status]} value={dayAttendance.isLoading || dayAttendance.isError ? "—" : count} hint="On the selected date" accent={STATUS_DOT[status]} />)}</div>
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <Button variant="ghost" size="icon-sm" onClick={() => setDateKey(shiftDay(dateKey, -1))} aria-label="Previous day">
            <ChevronLeft className="size-4" />
          </Button>
          <input
            type="date"
            value={dateKey}
            max={todayPhKey}
            onChange={(event) => event.target.value && setDateKey(event.target.value)}
            aria-label="Attendance date"
            className="h-11 min-w-0 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
        <p className="text-sm font-medium text-muted-foreground">{dayLabel}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
<div><h2 className="text-lg font-semibold">Team directory</h2><p className="text-xs text-muted-foreground">Select an employee&apos;s calendar for a closer look.</p></div>
<div className="flex min-w-0 flex-col gap-2 sm:flex-row"><label className="flex min-h-11 items-center gap-2 rounded-xl border border-input bg-card px-3 focus-within:ring-2 focus-within:ring-ring"><Search className="size-4 shrink-0 text-muted-foreground" /><input aria-label="Search employees" placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full min-w-0 bg-transparent text-sm outline-none" /></label><select aria-label="Filter attendance status" value={status} onChange={(e) => setStatus(e.target.value)} className="min-h-11 rounded-xl border border-input bg-card px-3 text-sm"><option value="all">All statuses</option>{COUNT_ORDER.map((key) => <option key={key} value={key}>{STATUS_LABEL[key]}</option>)}</select></div></div>

      {dayAttendance.isError ? <OperationsState title="Attendance is unavailable" onRetry={() => void dayAttendance.refetch()} /> : <TeamAttendanceTable
        dayEntries={filteredEntries}
        periodEntries={periodSummary.data ?? []}
        isLoading={dayAttendance.isLoading}
        onViewCalendar={(userId, name) => setViewing({ userId, name })}
      />}
      {periodSummary.isError && <OperationsState title="Period totals could not be loaded" description="Daily attendance is still available above." onRetry={() => void periodSummary.refetch()} />}

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
