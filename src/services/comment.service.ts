import { apiClient } from "@/lib/api-client";
import { CreateCommentInput, TaskComment } from "@/types/comment";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function listComments(taskId: string): Promise<TaskComment[]> {
  const res = await apiClient.get<ApiEnvelope<TaskComment[]>>(`/tasks/${taskId}/comments`);
  return res.data.data;
}

export async function createComment(taskId: string, input: CreateCommentInput): Promise<TaskComment> {
  const res = await apiClient.post<ApiEnvelope<TaskComment>>(`/tasks/${taskId}/comments`, input);
  return res.data.data;
}

export async function updateComment(commentId: string, message: string): Promise<TaskComment> {
  const res = await apiClient.patch<ApiEnvelope<TaskComment>>(`/comments/${commentId}`, { message });
  return res.data.data;
}

export async function deleteComment(commentId: string): Promise<void> {
  await apiClient.delete(`/comments/${commentId}`);
}
