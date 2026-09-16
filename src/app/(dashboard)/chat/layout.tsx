"use client";

import { usePathname } from "next/navigation";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useChannels } from "@/hooks/useChannels";
import { useAuth } from "@/providers/AuthProvider";
import { ChannelList } from "@/components/chat/ChannelList";
import { NewDmDialog } from "@/components/chat/NewDmDialog";
import { NewGroupDialog } from "@/components/chat/NewGroupDialog";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { data: channels } = useChannels();
  const isThreadOpen = pathname !== "/chat";

  const sidebar = (
    <div className="flex h-full min-w-0 w-full flex-col bg-card md:w-72 md:shrink-0 md:border-r md:border-border">
      <div className="border-b border-violet-500/25 bg-violet-500/8 px-4 py-3 shadow-[inset_3px_0_0_theme(colors.violet.500)]">
        <p className="text-[10px] font-medium text-muted-foreground">Workspace</p>
        <h1 className="text-base font-semibold">Catalyst Space</h1>
      </div>
      <div className="flex gap-2 border-b border-border p-2">
        <NewDmDialog />
        <NewGroupDialog />
      </div>
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
