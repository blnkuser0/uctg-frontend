import { TaskAttachment } from "./task";

export interface Message {
  _id: string;
  organizationId: string;
  channelId: string;
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

export interface CreateMessageInput {
  message: string;
  mentions?: string[];
}
