import { apiClient } from "@/lib/api-client";
import { CreateLeaveInput, Leave, LeaveDecisionInput } from "@/types/leave";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function createLeave(input: CreateLeaveInput): Promise<Leave> {
  const res = await apiClient.post<ApiEnvelope<Leave>>("/leaves", input);
  return res.data.data;
}

export async function listAllLeaves(): Promise<Leave[]> {
  const res = await apiClient.get<ApiEnvelope<Leave[]>>("/leaves");
  return res.data.data;
}

export async function listMyLeaves(): Promise<Leave[]> {
  const res = await apiClient.get<ApiEnvelope<Leave[]>>("/leaves/mine");
  return res.data.data;
}

export async function setHrDecision(leaveId: string, input: LeaveDecisionInput): Promise<Leave> {
  const res = await apiClient.patch<ApiEnvelope<Leave>>(`/leaves/${leaveId}/hr-decision`, input);
  return res.data.data;
}

export async function setAdminDecision(leaveId: string, input: LeaveDecisionInput): Promise<Leave> {
  const res = await apiClient.patch<ApiEnvelope<Leave>>(`/leaves/${leaveId}/admin-decision`, input);
  return res.data.data;
}

export async function cancelLeave(leaveId: string): Promise<void> {
  await apiClient.delete(`/leaves/${leaveId}`);
}
