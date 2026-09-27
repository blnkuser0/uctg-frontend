import { apiClient } from "@/lib/api-client";
import { DaySummary, PeriodSummary, TeamDayEntry, TeamPeriodEntry, TodayTimeLog, TimeLogType } from "@/types/timeLog";

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

/** month: "YYYY-MM". userId (someone else's) needs the attendance.view_summary permission. */
export async function getMonthSummary(month: string, userId?: string): Promise<DaySummary[]> {
  const res = await apiClient.get<ApiEnvelope<DaySummary[]>>("/timeclock/calendar", { params: { month, userId } });
  return res.data.data;
}

/** date: "YYYY-MM-DD" */
export async function getTeamDaySummary(date: string): Promise<TeamDayEntry[]> {
  const res = await apiClient.get<ApiEnvelope<TeamDayEntry[]>>("/timeclock/team", { params: { date } });
  return res.data.data;
}

/** Week + cut-off totals containing date ("YYYY-MM-DD"). userId (someone else's) needs attendance.view_summary. */
export async function getPeriodSummary(date: string, userId?: string): Promise<PeriodSummary> {
  const res = await apiClient.get<ApiEnvelope<PeriodSummary>>("/timeclock/summary", { params: { date, userId } });
  return res.data.data;
}

export async function getTeamPeriodSummary(date: string): Promise<TeamPeriodEntry[]> {
  const res = await apiClient.get<ApiEnvelope<TeamPeriodEntry[]>>("/timeclock/summary/team", { params: { date } });
  return res.data.data;
}
