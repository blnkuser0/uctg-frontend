import { TaskAttachment } from "./task";

export interface TaskComment {
  _id: string;
  organizationId: string;
  projectId: string;
  taskId: string;
  userId: string;
  authorName: string;
  authorAvatar: string | null;
  message: string;
  mentions: string[];
  attachments: TaskAttachment[];
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentInput {
  message: string;
  mentions?: string[];
}
