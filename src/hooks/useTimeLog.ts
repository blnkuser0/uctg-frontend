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

/** month: "YYYY-MM"; userId views another employee (needs attendance.view_summary), omitted = me. */
export function useMonthAttendance(month: string, userId?: string) {
  return useQuery({
    queryKey: ["timeclock", "calendar", month, userId ?? "me"] as const,
    queryFn: () => timeLogService.getMonthSummary(month, userId),
  });
}

/** Week + cut-off hours/days containing date ("YYYY-MM-DD"). */
export function usePeriodSummary(date: string, userId?: string) {
  return useQuery({
    queryKey: ["timeclock", "summary", date, userId ?? "me"] as const,
    queryFn: () => timeLogService.getPeriodSummary(date, userId),
  });
}

export function useTeamPeriodSummary(date: string, enabled: boolean) {
  return useQuery({
    queryKey: ["timeclock", "summary", "team", date] as const,
    queryFn: () => timeLogService.getTeamPeriodSummary(date),
    enabled,
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
