import { apiClient } from "@/lib/api-client";
import { CreateStageInput, Stage, UpdateStageInput } from "@/types/stage";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function listStages(projectId: string): Promise<Stage[]> {
  const res = await apiClient.get<ApiEnvelope<Stage[]>>(`/projects/${projectId}/stages`);
  return res.data.data;
}

export async function createStage(projectId: string, input: CreateStageInput): Promise<Stage> {
  const res = await apiClient.post<ApiEnvelope<Stage>>(`/projects/${projectId}/stages`, input);
  return res.data.data;
}

export async function updateStage(stageId: string, input: UpdateStageInput): Promise<Stage> {
  const res = await apiClient.patch<ApiEnvelope<Stage>>(`/stages/${stageId}`, input);
  return res.data.data;
}

export async function reorderStages(projectId: string, orderedIds: string[]): Promise<void> {
  await apiClient.patch(`/projects/${projectId}/stages/reorder`, { orderedIds });
}

export async function deleteStage(stageId: string, reassignToStageId?: string): Promise<void> {
  await apiClient.delete(`/stages/${stageId}`, { data: { reassignToStageId } });
}
