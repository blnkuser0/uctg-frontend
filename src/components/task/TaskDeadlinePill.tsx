"use client";

import { CalendarClock } from "lucide-react";
import { cn, formatDueDate } from "@/lib/utils";

const TONE_CLASSES: Record<"gray" | "amber" | "red", string> = {
  gray: "bg-muted text-muted-foreground",
  amber: "bg-amber-500/15 text-amber-600",
  red: "bg-destructive/15 text-destructive",
};

export function TaskDeadlinePill({ deadline }: { deadline: string | null }) {
  if (!deadline) return null;
  const { label, tone } = formatDueDate(deadline);

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", TONE_CLASSES[tone])}>
      <CalendarClock className="size-3" />
      {label}
    </span>
  );
}
