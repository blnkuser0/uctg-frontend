"use client";

import { toast } from "sonner";
import { useTodayTimeLog, useClock } from "@/hooks/useTimeLog";
import { ClockStatusCard } from "@/components/timeproof/ClockStatusCard";
import { ClockActionButtons } from "@/components/timeproof/ClockActionButtons";
import { TodayLogList } from "@/components/timeproof/TodayLogList";
import { TimeLogType } from "@/types/timeLog";

export default function TimeproofPage() {
  const { data, isLoading } = useTodayTimeLog();
  const clockMutation = useClock();

  function handleAction(type: TimeLogType) {
    clockMutation.mutate(
      { type },
      {
        onError: () => toast.error("Could not record that action. Please try again."),
      }
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="size-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="catalyst-page max-w-3xl">
      <div>
        <p className="catalyst-eyebrow">Presence station</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Timeproof</h1>
        <p className="mt-1 text-sm text-muted-foreground">Record verified time, breaks, and lunch in one clear rhythm.</p>
      </div>

      <ClockStatusCard state={data.state} />
      <ClockActionButtons state={data.state} onAction={handleAction} isPending={clockMutation.isPending} />

      <div>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Today&apos;s activity</h2>
        <TodayLogList logs={data.logs} />
      </div>
    </div>
  );
}
