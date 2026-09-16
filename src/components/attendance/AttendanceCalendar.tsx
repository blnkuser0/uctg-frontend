"use client";

import { MonthGrid } from "@/components/calendar/MonthGrid";
import { cn } from "@/lib/utils";
import { DaySummary } from "@/types/timeLog";

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
    <div className="min-w-[34rem]">
      <MonthGrid
        year={year}
        month={month}
        selectedDateKey={selectedDateKey}
        onSelectDate={onSelectDate}
        renderDay={(_date, dateKey) => {
          const summary = byDate.get(dateKey);
          return <span className={cn("size-1.5 rounded-full", summary ? STATUS_DOT[summary.status] : "bg-transparent")} />;
        }}
      />
    </div>
  );
}
