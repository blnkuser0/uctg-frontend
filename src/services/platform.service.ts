import { apiClient } from "@/lib/api-client";
import { Project } from "@/types/project";
import { CreateOrganizationInput, CreatePlatformUserInput, Developer, PlatformOrganization } from "@/types/platform";
import { User } from "@/types/user";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function listOrganizations(): Promise<PlatformOrganization[]> {
  const res = await apiClient.get<ApiEnvelope<PlatformOrganization[]>>("/platform/organizations");
  return res.data.data;
}

export async function createOrganization(input: CreateOrganizationInput): Promise<User> {
  const res = await apiClient.post<ApiEnvelope<User>>("/platform/organizations", input);
  return res.data.data;
}

export async function createPlatformUser(input: CreatePlatformUserInput): Promise<User> {
  const res = await apiClient.post<ApiEnvelope<User>>("/platform/users", input);
  return res.data.data;
}

export async function listDevelopers(): Promise<Developer[]> {
  const res = await apiClient.get<ApiEnvelope<Developer[]>>("/platform/developers");
  return res.data.data;
}

export async function listAllProjects(): Promise<Project[]> {
  const res = await apiClient.get<ApiEnvelope<Project[]>>("/platform/projects");
  return res.data.data;
}

export async function assignDeveloper(projectId: string, userId: string): Promise<Project> {
  const res = await apiClient.post<ApiEnvelope<Project>>(`/platform/projects/${projectId}/developers`, { userId });
  return res.data.data;
}

export async function unassignDeveloper(projectId: string, userId: string): Promise<Project> {
  const res = await apiClient.delete<ApiEnvelope<Project>>(`/platform/projects/${projectId}/developers/${userId}`);
  return res.data.data;
}
