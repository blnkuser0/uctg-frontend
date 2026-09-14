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
        <div className="size-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-lg font-semibold">Timeproof</h1>
        <p className="text-sm text-muted-foreground">Record your time in/out, breaks, and lunch.</p>
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
