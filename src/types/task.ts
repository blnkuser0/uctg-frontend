export type TaskPriority = "urgent" | "high" | "normal" | "low" | null;

export interface ChecklistItem {
  _id: string;
  text: string;
  isChecked: boolean;
  order: number;
  completedBy: string | null;
  completedAt: string | null;
}

export interface TaskAttachment {
  url: string;
  fileKey: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  createdAt: string;
}

export interface Task {
  _id: string;
  organizationId: string;
  projectId: string;
  stageId: string;
  parentTaskId: string | null;
  taskNumber: number;
  title: string;
  description: string;
  priority: TaskPriority;
  labelIds: string[];
  createdBy: string;
  assigneeIds: string[];
  startDate: string | null;
  deadline: string | null;
  order: number;
  checklist: ChecklistItem[];
  checklistProgress: number;
  estimateMinutes: number | null;
  trackedMinutes: number;
  attachments: TaskAttachment[];
  commentCount: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  stageId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  assigneeIds?: string[];
  labelIds?: string[];
  startDate?: string | null;
  deadline?: string | null;
  parentTaskId?: string | null;
  estimateMinutes?: number | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  assigneeIds?: string[];
  labelIds?: string[];
  startDate?: string | null;
  deadline?: string | null;
  estimateMinutes?: number | null;
}

export interface TaskListFilters {
  stageId?: string;
  assigneeId?: string;
  labelId?: string;
  priority?: Exclude<TaskPriority, null>;
  q?: string;
  includeSubtasks?: boolean;
}
