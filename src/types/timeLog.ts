export type TimeLogType = "time-in" | "time-out" | "break-in" | "break-out" | "lunch-in" | "lunch-out";

export type ClockState = "clocked-out" | "working" | "on-break" | "on-lunch";

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
}

export interface TeamDayEntry {
  userId: string;
  name: string;
  summary: DaySummary;
}
