import { apiClient } from "@/lib/api-client";
import { CreateManualTimeEntryInput, TimeEntry } from "@/types/timeEntry";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function listTimeEntries(taskId: string): Promise<TimeEntry[]> {
  const res = await apiClient.get<ApiEnvelope<TimeEntry[]>>(`/tasks/${taskId}/time-entries`);
  return res.data.data;
}

export async function startTimer(taskId: string): Promise<TimeEntry> {
  const res = await apiClient.post<ApiEnvelope<TimeEntry>>(`/tasks/${taskId}/timer/start`);
  return res.data.data;
}

export async function stopTimer(taskId: string): Promise<TimeEntry> {
  const res = await apiClient.post<ApiEnvelope<TimeEntry>>(`/tasks/${taskId}/timer/stop`);
  return res.data.data;
}

export async function createManualEntry(taskId: string, input: CreateManualTimeEntryInput): Promise<TimeEntry> {
  const res = await apiClient.post<ApiEnvelope<TimeEntry>>(`/tasks/${taskId}/time-entries`, input);
  return res.data.data;
}

export async function deleteTimeEntry(entryId: string): Promise<void> {
  await apiClient.delete(`/time-entries/${entryId}`);
}
