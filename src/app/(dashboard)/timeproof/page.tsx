"use client";

import { toast } from "sonner";
import { useTodayTimeLog, useClock } from "@/hooks/useTimeLog";
import { TimeClockCard } from "@/components/timeproof/TimeClockCard";
import { TodayLogList } from "@/components/timeproof/TodayLogList";
import { PersonalAttendance } from "@/components/attendance/PersonalAttendance";
import { TimeLogType } from "@/types/timeLog";
import { OperationsHeader, OperationsLink, OperationsState } from "@/components/layout/OperationsUI";

export default function TimeproofPage() {
  const { data, isLoading, isError, refetch } = useTodayTimeLog();
  const clockMutation = useClock();

  function handleAction(type: TimeLogType, note?: string) {
    clockMutation.mutate(
      { type, note },
      {
        onError: () => toast.error("Could not record that action. Please try again."),
      }
    );
  }


  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 p-4 sm:p-6 xl:p-8">
      <OperationsHeader title="Timeproof" description="Your shift, breaks, and attendance. Everything you need for the workday, in one place." actions={<OperationsLink href="/leaves">Plan time away</OperationsLink>} />
      {isError ? <OperationsState title="Your shift could not be loaded" description="Check your connection and try again before recording an action." onRetry={() => void refetch()} /> : isLoading || !data ? <OperationsState loading title="Loading your workday..." /> : <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <TimeClockCard logs={data.logs} state={data.state} onAction={handleAction} isPending={clockMutation.isPending} />
        <TodayLogList logs={data.logs} />
      </div>}
      <div>
        <div className="mb-4"><h2 className="text-lg font-semibold tracking-tight">Your attendance at a glance</h2><p className="mt-1 text-sm text-muted-foreground">Choose a day to explore your hours and attendance record.</p></div>
        <PersonalAttendance />
      </div>
    </div>
  );
}
