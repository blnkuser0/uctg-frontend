import { apiClient } from "@/lib/api-client";
import { CreateTaskInput, Task, TaskListFilters, UpdateTaskInput } from "@/types/task";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function listTasks(projectId: string, filters: TaskListFilters = {}): Promise<Task[]> {
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ""));
  const res = await apiClient.get<ApiEnvelope<Task[]>>(`/projects/${projectId}/tasks`, { params });
  return res.data.data;
}

export async function getTask(taskId: string): Promise<Task> {
  const res = await apiClient.get<ApiEnvelope<Task>>(`/tasks/${taskId}`);
  return res.data.data;
}

export async function createTask(projectId: string, input: CreateTaskInput): Promise<Task> {
  const res = await apiClient.post<ApiEnvelope<Task>>(`/projects/${projectId}/tasks`, input);
  return res.data.data;
}

export async function updateTask(taskId: string, input: UpdateTaskInput): Promise<Task> {
  const res = await apiClient.patch<ApiEnvelope<Task>>(`/tasks/${taskId}`, input);
  return res.data.data;
}

export async function deleteTask(taskId: string): Promise<void> {
  await apiClient.delete(`/tasks/${taskId}`);
}

export async function moveTask(taskId: string, stageId: string, order: number): Promise<Task> {
  const res = await apiClient.patch<ApiEnvelope<Task>>(`/tasks/${taskId}/move`, { stageId, order });
  return res.data.data;
}

export async function createSubtask(
  taskId: string,
  input: { title: string; description?: string; priority?: Task["priority"]; assigneeIds?: string[] }
): Promise<Task> {
  const res = await apiClient.post<ApiEnvelope<Task>>(`/tasks/${taskId}/subtasks`, input);
  return res.data.data;
}

export async function listSubtasks(taskId: string): Promise<Task[]> {
  const res = await apiClient.get<ApiEnvelope<Task[]>>(`/tasks/${taskId}/subtasks`);
  return res.data.data;
}

export async function addChecklistItem(taskId: string, text: string): Promise<Task> {
  const res = await apiClient.post<ApiEnvelope<Task>>(`/tasks/${taskId}/checklist-items`, { text });
  return res.data.data;
}

export async function updateChecklistItem(
  taskId: string,
  itemId: string,
  updates: { text?: string; isChecked?: boolean }
): Promise<Task> {
  const res = await apiClient.patch<ApiEnvelope<Task>>(`/tasks/${taskId}/checklist-items/${itemId}`, updates);
  return res.data.data;
}

export async function deleteChecklistItem(taskId: string, itemId: string): Promise<Task> {
  const res = await apiClient.delete<ApiEnvelope<Task>>(`/tasks/${taskId}/checklist-items/${itemId}`);
  return res.data.data;
}

export async function addAttachments(taskId: string, files: File[]): Promise<Task> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const res = await apiClient.post<ApiEnvelope<Task>>(`/tasks/${taskId}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

export async function removeAttachment(taskId: string, fileKey: string): Promise<Task> {
  const res = await apiClient.delete<ApiEnvelope<Task>>(
    `/tasks/${taskId}/attachments/${encodeURIComponent(fileKey)}`
  );
  return res.data.data;
}
