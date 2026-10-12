import { ShiftType } from "./user";

export type TimeLogType = "time-in" | "time-out" | "break-in" | "break-out";

export type ClockState = "clocked-out" | "working" | "on-break";

export interface TimeLog {
  _id: string;
  organizationId: string;
  userId: string;
  type: TimeLogType;
  timestamp: string;
  note: string | null;
}

export interface TodayTimeLog {
  logs: TimeLog[];
  state: ClockState;
}

export type DayAttendanceStatus = "present" | "on-leave" | "absent" | "weekend" | "upcoming";

export interface DaySummary {
  date: string; // YYYY-MM-DD
  status: DayAttendanceStatus;
  firstTimeIn: string | null;
  lastTimeOut: string | null;
  workedMinutes: number;
  breakMinutes: number;
}

// Flagged red once a single break reaches this length; shown orange up to it. Mirrors backend/src/utils/attendance.ts.
export const BREAK_LIMIT_MINUTES = 60;

export interface TeamDayEntry {
  userId: string;
  name: string;
  shiftType: ShiftType;
  summary: DaySummary;
}

export interface PeriodStats {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  totalMinutes: number;
  daysPresent: number;
}

export interface PeriodSummary {
  week: PeriodStats;
  cutoff: PeriodStats;
}

export interface TeamPeriodEntry {
  userId: string;
  name: string;
  shiftType: ShiftType;
  summary: PeriodSummary;
}
