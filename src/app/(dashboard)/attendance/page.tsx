"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AttendanceCalendar, STATUS_DOT, STATUS_LABEL } from "@/components/attendance/AttendanceCalendar";
import { AttendanceDayDetail } from "@/components/attendance/AttendanceDayDetail";
import { TeamRoster } from "@/components/attendance/TeamRoster";
import { useMonthAttendance, useTeamAttendance } from "@/hooks/useTimeLog";
import { useAuth } from "@/providers/AuthProvider";
import { toPhDateKey } from "@/lib/utils";
import { PERMISSIONS } from "@/types/role";
import { DayAttendanceStatus } from "@/types/timeLog";

const LEGEND_ORDER: DayAttendanceStatus[] = ["present", "on-leave", "absent", "weekend"];

export default function AttendancePage() {
  const { user } = useAuth();
  const canViewTeam = user?.role.permissions.includes(PERMISSIONS.ATTENDANCE_VIEW_ALL) ?? false;

  const todayPhKey = toPhDateKey(new Date());
  const [todayYear, todayMonth] = todayPhKey.split("-").map(Number);
  const [year, setYear] = useState(todayYear);
  const [month, setMonth] = useState(todayMonth); // 1-12
  const [selectedDateKey, setSelectedDateKey] = useState(todayPhKey);

  const { data: summaries, isLoading } = useMonthAttendance(`${year}-${String(month).padStart(2, "0")}`);
  const teamAttendance = useTeamAttendance(selectedDateKey, canViewTeam);

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const selectedSummary = (summaries ?? []).find((s) => s.date === selectedDateKey);

  function shiftMonth(delta: number) {
    const next = new Date(year, month - 1 + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth() + 1);
  }

  return (
    <div className="catalyst-page max-w-5xl">
      <div>
        <p className="catalyst-eyebrow">Team rhythm</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Attendance</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your verified presence and the team&apos;s working cadence at a glance.</p>
      </div>

      <div className="catalyst-panel p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon-sm" onClick={() => shiftMonth(-1)} aria-label="Previous month">
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-semibold">{monthLabel}</span>
          <Button variant="ghost" size="icon-sm" onClick={() => shiftMonth(1)} aria-label="Next month">
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="size-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          </div>
        ) : (
          <div className="mt-3">
            <AttendanceCalendar
              year={year}
              month={month}
              summaries={summaries ?? []}
              selectedDateKey={selectedDateKey}
              onSelectDate={setSelectedDateKey}
            />
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-3 border-t border-border pt-3">
          {LEGEND_ORDER.map((status) => (
            <span key={status} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className={`size-2 rounded-full ${STATUS_DOT[status]}`} />
              {STATUS_LABEL[status]}
            </span>
          ))}
        </div>
      </div>

      <AttendanceDayDetail dateKey={selectedDateKey} summary={selectedSummary} />

      {canViewTeam && (
        <TeamRoster dateKey={selectedDateKey} entries={teamAttendance.data ?? []} isLoading={teamAttendance.isLoading} />
      )}
    </div>
  );
}
