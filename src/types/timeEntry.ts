export type TimeEntrySource = "timer" | "manual";

export interface TimeEntry {
  _id: string;
  organizationId: string;
  taskId: string;
  projectId: string;
  userId: string;
  source: TimeEntrySource;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number | null;
  note: string;
  createdAt: string;
}

export interface CreateManualTimeEntryInput {
  startedAt: string;
  endedAt: string;
  note?: string;
}
