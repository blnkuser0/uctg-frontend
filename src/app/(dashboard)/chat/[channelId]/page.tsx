"use client";

import { use } from "react";
import { MessageThread } from "@/components/chat/MessageThread";
import { useChannels } from "@/hooks/useChannels";
import { useAuth } from "@/providers/AuthProvider";

export default function ChannelThreadPage({ params }: { params: Promise<{ channelId: string }> }) {
  const { channelId } = use(params);
  const { user } = useAuth();
  const { data: channels, isLoading } = useChannels();
  const channel = channels?.find((c) => c._id === channelId);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex h-full flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
        Conversation not found.
      </div>
    );
  }

  // Keyed by channel so switching conversations remounts the thread — its own reply-target,
  // open panel, etc. reset for free instead of needing an effect to sync them.
  return <MessageThread key={channel._id} channel={channel} currentUserId={user?.id ?? ""} />;
}
