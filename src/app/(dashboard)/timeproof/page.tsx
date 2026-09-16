"use client";

import { toast } from "sonner";
import { useTodayTimeLog, useClock } from "@/hooks/useTimeLog";
import { ClockStatusCard } from "@/components/timeproof/ClockStatusCard";
import { ClockActionButtons } from "@/components/timeproof/ClockActionButtons";
import { TodayLogList } from "@/components/timeproof/TodayLogList";
import { TimeLogType } from "@/types/timeLog";
import { PageHeader } from "@/components/layout/PageHeader";

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
    <div className="catalyst-page max-w-5xl">
      <PageHeader title="Timeproof" section="Operations / Work session" tone="amber" />

      <ClockStatusCard state={data.state} />
      <ClockActionButtons state={data.state} onAction={handleAction} isPending={clockMutation.isPending} />

      <div>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Today&apos;s activity</h2>
        <TodayLogList logs={data.logs} />
      </div>
    </div>
  );
}
