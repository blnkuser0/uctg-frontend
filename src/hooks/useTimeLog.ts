"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import * as timeLogService from "@/services/timeLog.service";
import { TimeLogType } from "@/types/timeLog";

export function useTodayTimeLog() {
  return useQuery({
    queryKey: queryKeys.timeLogToday(),
    queryFn: timeLogService.getToday,
  });
}

export function useClock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, note }: { type: TimeLogType; note?: string }) => timeLogService.clock(type, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeLogToday() });
    },
  });
}

/** month: "YYYY-MM" */
export function useMonthAttendance(month: string) {
  return useQuery({
    queryKey: ["timeclock", "calendar", month] as const,
    queryFn: () => timeLogService.getMonthSummary(month),
  });
}

/** date: "YYYY-MM-DD" */
export function useTeamAttendance(date: string, enabled: boolean) {
  return useQuery({
    queryKey: ["timeclock", "team", date] as const,
    queryFn: () => timeLogService.getTeamDaySummary(date),
    enabled,
  });
}
