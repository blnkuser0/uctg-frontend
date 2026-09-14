"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hash, LayoutGrid, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Channel } from "@/types/channel";
import { getChannelDisplayName } from "./channelDisplay";

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function ChannelListItem({ channel, currentUserId }: { channel: Channel; currentUserId: string }) {
  const pathname = usePathname();
  const href = `/chat/${channel._id}`;
  const active = pathname === href;

  const label = getChannelDisplayName(channel, currentUserId);
  let icon: React.ReactNode;

  if (channel.type === "dm") {
    const other = channel.memberIds.find((m) => m._id !== currentUserId) ?? channel.memberIds[0];
    icon = (
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className="bg-cyan-500/20 text-[10px] text-cyan-700">
          {other ? initials(other.name) : "?"}
        </AvatarFallback>
      </Avatar>
    );
  } else if (channel.type === "project") {
    icon = (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-sky-600">
        <LayoutGrid className="size-4" />
      </span>
    );
  } else {
    icon = (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Users className="size-4" />
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
        active ? "bg-cyan-500/15 text-cyan-600" : "hover:bg-muted"
      )}
    >
      {icon}
      <span className={cn("min-w-0 flex-1 truncate", channel.unreadCount > 0 ? "font-semibold" : "font-medium")}>
        {label}
      </span>
      {channel.unreadCount > 0 ? (
        <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-cyan-600 text-[10px] font-semibold text-white">
          {channel.unreadCount > 9 ? "9+" : channel.unreadCount}
        </span>
      ) : (
        channel.type !== "dm" && <Hash className="size-3 shrink-0 text-muted-foreground" />
      )}
    </Link>
  );
}
