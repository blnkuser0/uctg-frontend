"use client";

import { MonthGrid } from "@/components/calendar/MonthGrid";
import { cn, formatHours } from "@/lib/utils";
import { BREAK_LIMIT_MINUTES, DaySummary } from "@/types/timeLog";

const STATUS_DOT: Record<DaySummary["status"], string> = {
  present: "bg-emerald-500",
  "on-leave": "bg-sky-500",
  absent: "bg-destructive",
  weekend: "bg-muted-foreground/30",
  upcoming: "bg-transparent",
};

const STATUS_LABEL: Record<DaySummary["status"], string> = {
  present: "Present",
  "on-leave": "On leave",
  absent: "Absent",
  weekend: "Weekend",
  upcoming: "Upcoming",
};

export { STATUS_DOT, STATUS_LABEL };

interface AttendanceCalendarProps {
  year: number;
  month: number;
  summaries: DaySummary[];
  selectedDateKey?: string;
  onSelectDate: (dateKey: string) => void;
}

export function AttendanceCalendar({ year, month, summaries, selectedDateKey, onSelectDate }: AttendanceCalendarProps) {
  const byDate = new Map(summaries.map((s) => [s.date, s]));

  return (
    <div className="min-w-0">
      <MonthGrid
        year={year}
        month={month}
        selectedDateKey={selectedDateKey}
        onSelectDate={onSelectDate}
        renderDay={(_date, dateKey) => {
          const summary = byDate.get(dateKey);
          return (
            <>
              <span className={cn("size-1.5 rounded-full", summary ? STATUS_DOT[summary.status] : "bg-transparent")} />
              {summary && summary.workedMinutes > 0 && (
                <span className="max-w-full rounded px-0.5 py-0.5 text-[9px] leading-none whitespace-nowrap sm:px-1 sm:text-[10px] font-medium text-white bg-blue-600">
                  {formatHours(summary.workedMinutes)}
                </span>
              )}
              {summary && summary.breakMinutes > 0 && (
                <span
                  className={cn(
                    "max-w-full rounded px-0.5 py-0.5 text-[9px] leading-none whitespace-nowrap sm:px-1 sm:text-[10px] font-medium text-white",
                    summary.breakMinutes >= BREAK_LIMIT_MINUTES ? "bg-red-500" : "bg-orange-500"
                  )}
                >
                  {formatHours(summary.breakMinutes)}
                </span>
              )}
            </>
          );
        }}
      />
    </div>
  );
}
