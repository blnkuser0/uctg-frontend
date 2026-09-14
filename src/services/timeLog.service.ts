import { apiClient } from "@/lib/api-client";
import { DaySummary, TeamDayEntry, TodayTimeLog, TimeLogType } from "@/types/timeLog";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function getToday(): Promise<TodayTimeLog> {
  const res = await apiClient.get<ApiEnvelope<TodayTimeLog>>("/timeclock/today");
  return res.data.data;
}

export async function clock(type: TimeLogType, note?: string): Promise<{ state: TodayTimeLog["state"] }> {
  const res = await apiClient.post<ApiEnvelope<{ state: TodayTimeLog["state"] }>>("/timeclock/clock", { type, note });
  return res.data.data;
}

/** month: "YYYY-MM" */
export async function getMonthSummary(month: string): Promise<DaySummary[]> {
  const res = await apiClient.get<ApiEnvelope<DaySummary[]>>("/timeclock/calendar", { params: { month } });
  return res.data.data;
}

/** date: "YYYY-MM-DD" */
export async function getTeamDaySummary(date: string): Promise<TeamDayEntry[]> {
  const res = await apiClient.get<ApiEnvelope<TeamDayEntry[]>>("/timeclock/team", { params: { date } });
  return res.data.data;
}
