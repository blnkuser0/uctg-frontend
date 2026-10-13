"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Archive, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useChannels } from "@/hooks/useChannels";
import { useChannelListSocket } from "@/hooks/useChannelListSocket";
import { usePresenceTracking } from "@/hooks/usePresence";
import { useAuth } from "@/providers/AuthProvider";
import { ChannelList } from "@/components/chat/ChannelList";
import { NewDmDialog } from "@/components/chat/NewDmDialog";
import { NewGroupDialog } from "@/components/chat/NewGroupDialog";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [showArchived, setShowArchived] = useState(false);
  const { data: channels } = useChannels(showArchived);
  const isThreadOpen = pathname !== "/chat";
  useChannelListSocket();
  usePresenceTracking();

  const sidebar = (
    <div className="flex h-full min-w-0 w-full flex-col bg-card md:w-72 md:shrink-0 md:border-r md:border-border">
      <div className="flex items-center justify-between border-b border-violet-500/25 bg-violet-500/8 px-4 py-3 shadow-[inset_3px_0_0_theme(colors.violet.500)]">
        <div>
          <p className="text-[10px] font-medium text-muted-foreground">Workspace</p>
          <h1 className="text-base font-semibold">{showArchived ? "Archived Space" : "Catalyst Space"}</h1>
        </div>
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={() => setShowArchived((current) => !current)} aria-label={showArchived ? "Back to active conversations" : "Show archived conversations"} title={showArchived ? "Active conversations" : "Archived conversations"}>
          {showArchived ? <ArrowLeft className="size-4" /> : <Archive className="size-4" />}
        </Button>
      </div>
      {!showArchived && <div className="flex gap-2 border-b border-border p-2"><NewDmDialog /><NewGroupDialog /></div>}
      <div className="flex-1 overflow-y-auto">
        <ChannelList channels={channels ?? []} currentUserId={user?.id ?? ""} />
      </div>
    </div>
  );

  if (isMobile) {
    return isThreadOpen ? <div className="flex h-full flex-col">{children}</div> : sidebar;
  }

  return (
    <div className="flex h-full">
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
