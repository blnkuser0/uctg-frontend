import { apiClient } from "@/lib/api-client";
import { CreateLabelInput, Label, UpdateLabelInput } from "@/types/label";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function listLabels(projectId: string): Promise<Label[]> {
  const res = await apiClient.get<ApiEnvelope<Label[]>>(`/projects/${projectId}/labels`);
  return res.data.data;
}

export async function createLabel(projectId: string, input: CreateLabelInput): Promise<Label> {
  const res = await apiClient.post<ApiEnvelope<Label>>(`/projects/${projectId}/labels`, input);
  return res.data.data;
}

export async function updateLabel(labelId: string, input: UpdateLabelInput): Promise<Label> {
  const res = await apiClient.patch<ApiEnvelope<Label>>(`/labels/${labelId}`, input);
  return res.data.data;
}

export async function deleteLabel(labelId: string): Promise<void> {
  await apiClient.delete(`/labels/${labelId}`);
}
