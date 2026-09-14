"use client";

import { ClockState } from "@/types/timeLog";
import { cn } from "@/lib/utils";

const STATE_META: Record<ClockState, { label: string; dot: string }> = {
  "clocked-out": { label: "Not clocked in", dot: "bg-muted-foreground" },
  working: { label: "Working", dot: "bg-emerald-500" },
  "on-break": { label: "On break", dot: "bg-amber-500" },
  "on-lunch": { label: "On lunch", dot: "bg-amber-500" },
};

export function ClockStatusCard({ state }: { state: ClockState }) {
  const meta = STATE_META[state];

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4">
      <span className={cn("size-2.5 rounded-full", meta.dot)} />
      <div>
        <p className="text-xs text-muted-foreground">Current status</p>
        <p className="text-base font-semibold">{meta.label}</p>
      </div>
    </div>
  );
}
