"use client";

import { Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskPriority } from "@/types/task";

const PRIORITY_META: Record<Exclude<TaskPriority, null>, { label: string; className: string }> = {
  urgent: { label: "Urgent", className: "text-red-500" },
  high: { label: "High", className: "text-amber-500" },
  normal: { label: "Normal", className: "text-sky-500" },
  low: { label: "Low", className: "text-muted-foreground" },
};

export function TaskPriorityFlag({ priority, showLabel }: { priority: TaskPriority; showLabel?: boolean }) {
  if (!priority) return null;
  const meta = PRIORITY_META[priority];

  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", meta.className)} title={meta.label}>
      <Flag className="size-3.5 fill-current" />
      {showLabel && meta.label}
    </span>
  );
}
