import { TaskAttachment } from "./task";

export interface MessageReaction {
  emoji: string;
  userIds: string[];
}

export interface ReplyPreview {
  _id: string;
  authorName: string;
  message: string;
  isDeleted: boolean;
}

export interface Message {
  _id: string;
  organizationId: string;
  channelId: string;
  userId: string;
  authorName: string;
  authorAvatar: string | null;
  message: string;
  clientMessageId: string | null;
  mentions: string[];
  attachments: TaskAttachment[];
  reactions: MessageReaction[];
  replyToId: string | null;
  replyPreview: ReplyPreview | null;
  pinnedAt: string | null;
  pinnedBy: string | null;
  isEdited: boolean;
  scheduledFor: string | null;
  scheduledStatus: "pending" | "dispatching" | "sent" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageInput {
  message: string;
  mentions?: string[];
  replyToId?: string;
  clientMessageId?: string;
  scheduledFor?: string;
}
