"use client";

import { ChannelListItem } from "./ChannelListItem";
import { Channel } from "@/types/channel";

function Section({ title, channels, currentUserId }: { title: string; channels: Channel[]; currentUserId: string }) {
  if (channels.length === 0) return null;
  return (
    <div className="grid gap-0.5">
      <p className="px-2.5 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      {channels.map((channel) => (
        <ChannelListItem key={channel._id} channel={channel} currentUserId={currentUserId} />
      ))}
    </div>
  );
}

export function ChannelList({ channels, currentUserId }: { channels: Channel[]; currentUserId: string }) {
  const dms = channels.filter((c) => c.type === "dm");
  const groups = channels.filter((c) => c.type === "group");
  const projects = channels.filter((c) => c.type === "project");

  if (channels.length === 0) {
    return <p className="p-4 text-center text-sm text-muted-foreground">No conversations yet — start one below.</p>;
  }

  return (
    <div className="grid gap-1 p-2">
      <Section title="Direct messages" channels={dms} currentUserId={currentUserId} />
      <Section title="Groups" channels={groups} currentUserId={currentUserId} />
      <Section title="Projects" channels={projects} currentUserId={currentUserId} />
    </div>
  );
}
