import { Channel } from "@/types/channel";

export function getChannelDisplayName(channel: Channel, currentUserId: string): string {
  if (channel.type === "dm") {
    const other = channel.memberIds.find((m) => m._id !== currentUserId) ?? channel.memberIds[0];
    return other?.name ?? "Unknown";
  }
  return channel.name ?? (channel.type === "project" ? "Project" : "Group");
}
