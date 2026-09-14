"use client";

import { cn, toDateKey, toPhDateKey } from "@/lib/utils";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface MonthGridProps {
  year: number;
  month: number; // 1-12
  renderDay: (date: Date, dateKey: string) => React.ReactNode;
  onSelectDate?: (dateKey: string) => void;
  selectedDateKey?: string;
}

export function MonthGrid({ year, month, renderDay, onSelectDate, selectedDateKey }: MonthGridProps) {
  const firstOfMonth = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay();
  const todayKey = toPhDateKey(new Date());

  const cells: (Date | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month - 1, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="grid grid-cols-7 gap-1">
      {WEEKDAY_LABELS.map((label) => (
        <div key={label} className="pb-1 text-center text-[11px] font-medium text-muted-foreground">
          {label}
        </div>
      ))}
      {cells.map((date, i) => {
        if (!date) return <div key={`blank-${i}`} />;
        const dateKey = toDateKey(date);
        const isToday = dateKey === todayKey;
        const isSelected = dateKey === selectedDateKey;
        const content = (
          <>
            <span className={cn("text-[11px]", isToday && "font-semibold text-cyan-600")}>{date.getDate()}</span>
            {renderDay(date, dateKey)}
          </>
        );

        if (!onSelectDate) {
          return (
            <div key={dateKey} className="flex aspect-square flex-col items-center gap-0.5 rounded-lg p-1">
              {content}
            </div>
          );
        }

        return (
          <button
            key={dateKey}
            onClick={() => onSelectDate(dateKey)}
            className={cn(
              "flex aspect-square flex-col items-center gap-0.5 rounded-lg p-1 transition-colors hover:bg-muted",
              isSelected && "ring-2 ring-cyan-500"
            )}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
