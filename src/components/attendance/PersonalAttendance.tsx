"use client";

import { OperationsState } from "@/components/layout/OperationsUI";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMonthAttendance, usePeriodSummary } from "@/hooks/useTimeLog";
import { toPhDateKey } from "@/lib/utils";
import { DayAttendanceStatus } from "@/types/timeLog";
import { AttendanceCalendar, STATUS_DOT, STATUS_LABEL } from "./AttendanceCalendar";
import { AttendanceDayDetail } from "./AttendanceDayDetail";
import { PeriodSummaryCards } from "./PeriodSummaryCards";

const LEGEND_ORDER: DayAttendanceStatus[] = ["present", "on-leave", "absent", "weekend"];

// One person's month calendar (hours worked shown on each day), the selected day's detail, and
// their week + payroll cut-off totals. Timeproof renders it for the signed-in user (no userId);
// the Attendance page renders it for an employee a manager picked (userId, needs attendance.view_all).
export function PersonalAttendance({ userId }: { userId?: string }) {
  const todayPhKey = toPhDateKey(new Date());
  const [todayYear, todayMonth] = todayPhKey.split("-").map(Number);
  const [year, setYear] = useState(todayYear);
  const [month, setMonth] = useState(todayMonth); // 1-12
  const [selectedDateKey, setSelectedDateKey] = useState(todayPhKey);

  const { data: summaries, isLoading, isError, refetch } = useMonthAttendance(`${year}-${String(month).padStart(2, "0")}`, userId);
  const periodSummary = usePeriodSummary(selectedDateKey, userId);

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const selectedSummary = (summaries ?? []).find((s) => s.date === selectedDateKey);

  function shiftMonth(delta: number) {
    const next = new Date(year, month - 1 + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth() + 1);
    setSelectedDateKey(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-01`);
  }

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card p-4 sm:p-5 xl:row-span-2">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon-sm" onClick={() => shiftMonth(-1)} aria-label="Previous month">
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-semibold">{monthLabel}</span>
          <Button variant="ghost" size="icon-sm" onClick={() => shiftMonth(1)} aria-label="Next month">
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {isError ? <OperationsState title="Calendar unavailable" onRetry={() => void refetch()} /> : isLoading ? (
          <div className="flex justify-center py-10">
            <div className="size-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          </div>
        ) : (
          <div className="mt-3 min-w-0 overflow-x-auto overscroll-x-contain pb-1">
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

      <div className="min-w-0">{periodSummary.isError ? <OperationsState title="Totals unavailable" onRetry={() => void periodSummary.refetch()} /> : <PeriodSummaryCards summary={periodSummary.data} />}</div>

      {!isLoading && !isError && <AttendanceDayDetail dateKey={selectedDateKey} summary={selectedSummary} />}
    </div>
  );
}
