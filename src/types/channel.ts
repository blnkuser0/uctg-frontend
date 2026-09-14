export type ChannelType = "dm" | "group" | "project";

export interface ChannelMember {
  _id: string;
  name: string;
  avatarUrl: string | null;
}

export interface Channel {
  _id: string;
  organizationId: string;
  type: ChannelType;
  name: string | null;
  projectId: string | null;
  memberIds: ChannelMember[];
  dmKey: string | null;
  createdBy: string;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupInput {
  name: string;
  memberIds: string[];
}

export interface UpdateGroupInput {
  name?: string;
  addMemberId?: string;
  removeMemberId?: string;
}
