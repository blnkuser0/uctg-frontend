export type ProjectStatus = "active" | "archived";

export interface Project {
  _id: string;
  organizationId: string;
  name: string;
  key: string;
  description: string;
  color: string;
  status: ProjectStatus;
  createdBy: string;
  memberIds: string[];
  taskSeq: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  key?: string;
  description?: string;
  color?: string;
  organizationId?: string;
  memberIds?: string[];
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  color?: string;
  status?: ProjectStatus;
}
