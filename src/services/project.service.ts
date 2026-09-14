import { apiClient } from "@/lib/api-client";
import { CreateProjectInput, Project, UpdateProjectInput } from "@/types/project";
import { ProjectReport } from "@/types/report";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function listMyProjects(): Promise<Project[]> {
  const res = await apiClient.get<ApiEnvelope<Project[]>>("/projects");
  return res.data.data;
}

export async function listAllProjects(): Promise<Project[]> {
  const res = await apiClient.get<ApiEnvelope<Project[]>>("/projects?all=true");
  return res.data.data;
}

export async function getProject(projectId: string): Promise<Project> {
  const res = await apiClient.get<ApiEnvelope<Project>>(`/projects/${projectId}`);
  return res.data.data;
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const res = await apiClient.post<ApiEnvelope<Project>>("/projects", input);
  return res.data.data;
}

export async function updateProject(projectId: string, input: UpdateProjectInput): Promise<Project> {
  const res = await apiClient.patch<ApiEnvelope<Project>>(`/projects/${projectId}`, input);
  return res.data.data;
}

export async function deleteProject(projectId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}`);
}

export async function addMember(projectId: string, userId: string): Promise<Project> {
  const res = await apiClient.post<ApiEnvelope<Project>>(`/projects/${projectId}/members`, { userId });
  return res.data.data;
}

export async function removeMember(projectId: string, userId: string): Promise<Project> {
  const res = await apiClient.delete<ApiEnvelope<Project>>(`/projects/${projectId}/members/${userId}`);
  return res.data.data;
}

export async function getProjectReport(projectId: string): Promise<ProjectReport> {
  const res = await apiClient.get<ApiEnvelope<ProjectReport>>(`/projects/${projectId}/report`);
  return res.data.data;
}
