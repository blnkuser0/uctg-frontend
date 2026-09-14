export type NotificationType =
  | "task_assigned"
  | "task_comment"
  | "task_mention"
  | "task_deadline"
  | "project_added"
  | "checklist_completed"
  | "leave_submitted"
  | "leave_hr_decided"
  | "leave_decided"
  | "dm_message"
  | "message_mention";

export interface AppNotification {
  _id: string;
  organizationId: string;
  userId: string;
  type: NotificationType;
  projectId: string | null;
  taskId: string | null;
  commentId: string | null;
  leaveId: string | null;
  channelId: string | null;
  messageId: string | null;
  actorId: string;
  actorName: string;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}
