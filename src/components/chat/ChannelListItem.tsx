"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bell, BellOff, Hash, LayoutGrid, LogOut, MailOpen, MoreHorizontal, Pin, PinOff, Trash2, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useHideDm,
  useMarkChannelRead,
  useMarkChannelUnread,
  useSetChannelMuted,
  useSetChannelPinned,
  useUpdateGroup,
} from "@/hooks/useChannels";
import { useIsOnline } from "@/hooks/usePresence";
import { avatarGradient, cn } from "@/lib/utils";
import { Channel } from "@/types/channel";
import { getChannelDisplayName } from "./channelDisplay";
import { OnlineDot } from "./OnlineDot";

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function ChannelListItem({ channel, currentUserId }: { channel: Channel; currentUserId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const href = `/chat/${channel._id}`;
  const active = pathname === href;
  const other = channel.type === "dm" ? (channel.memberIds.find((m) => m._id !== currentUserId) ?? channel.memberIds[0]) : null;
  const otherOnline = useIsOnline(other?._id);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const markRead = useMarkChannelRead();
  const markUnread = useMarkChannelUnread();
  const setPinned = useSetChannelPinned();
  const setMuted = useSetChannelMuted();
  const hideDm = useHideDm();
  const updateGroup = useUpdateGroup();

  const label = getChannelDisplayName(channel, currentUserId);
  const isUnread = channel.unreadCount > 0;
  // Only a DM is "deleted" from just your own list — a group is left instead (removes you from
  // membership for real), and a project channel follows the project's own membership, so neither
  // gets a delete/leave action here.
  const canRemove = channel.type === "dm" || channel.type === "group";

  function handleRemove() {
    if (channel.type === "dm") {
      hideDm.mutate(channel._id, {
        onSuccess: () => {
          setConfirmOpen(false);
          if (active) router.push("/chat");
          toast.success("Conversation removed");
        },
        onError: () => toast.error("Could not delete this conversation."),
      });
    } else {
      updateGroup.mutate(
        { channelId: channel._id, input: { removeMemberId: currentUserId } },
        {
          onSuccess: () => {
            setConfirmOpen(false);
            if (active) router.push("/chat");
            toast.success("You left the conversation");
          },
          onError: () => toast.error("Could not leave the conversation."),
        }
      );
    }
  }

  let icon: React.ReactNode;
  if (channel.type === "dm") {
    icon = (
      <span className="relative shrink-0">
        <Avatar className="size-8">
          <AvatarFallback className={cn("text-[10px] font-medium text-white", avatarGradient(other?._id ?? label))}>
            {other ? initials(other.name) : "?"}
          </AvatarFallback>
        </Avatar>
        {otherOnline && <OnlineDot ringClassName="ring-card" />}
      </span>
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

  const removing = hideDm.isPending || updateGroup.isPending;

  return (
    <div
      className={cn(
        "group flex items-center gap-2.5 rounded-r-lg border-l-2 py-2 pr-1.5 pl-2 text-sm transition-colors",
        active ? "border-primary bg-primary/10 text-primary" : "border-transparent hover:bg-muted"
      )}
    >
      <Link href={href} className="flex min-w-0 flex-1 items-center gap-2.5">
        {icon}
        <span className={cn("min-w-0 flex-1 truncate", isUnread ? "font-semibold" : "font-medium")}>{label}</span>
        {channel.pinned && <Pin className="size-3 shrink-0 fill-current text-muted-foreground" aria-label="Pinned" />}
        {channel.muted && <BellOff className="size-3 shrink-0 text-muted-foreground" aria-label="Muted" />}
        {isUnread ? (
          <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            {channel.unreadCount > 9 ? "9+" : channel.unreadCount}
          </span>
        ) : (
          channel.type !== "dm" && <Hash className="size-3 shrink-0 text-muted-foreground" />
        )}
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              aria-label={`More actions for ${label}`}
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100"
            >
              <MoreHorizontal className="size-3.5" />
            </button>
          }
        />
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuItem onClick={() => (isUnread ? markRead : markUnread).mutate(channel._id)}>
            <MailOpen className="size-4" />
            {isUnread ? "Mark as read" : "Mark as unread"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPinned.mutate({ channelId: channel._id, pinned: !channel.pinned })}>
            {channel.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
            {channel.pinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setMuted.mutate({ channelId: channel._id, muted: !channel.muted })}>
            {channel.muted ? <Bell className="size-4" /> : <BellOff className="size-4" />}
            {channel.muted ? "Unmute" : "Mute"}
          </DropdownMenuItem>
          {canRemove && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
                {channel.type === "dm" ? <Trash2 className="size-4" /> : <LogOut className="size-4" />}
                {channel.type === "dm" ? "Delete conversation" : "Leave conversation"}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{channel.type === "dm" ? "Delete conversation?" : "Leave conversation?"}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {channel.type === "dm" ? (
              <>
                &ldquo;{label}&rdquo; will be removed from your list. It comes back automatically if either of you sends a new
                message.
              </>
            ) : (
              <>You&apos;ll be removed from &ldquo;{label}&rdquo; and won&apos;t see new messages unless someone adds you back.</>
            )}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={removing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemove} disabled={removing}>
              {removing ? "Removing..." : channel.type === "dm" ? "Delete" : "Leave"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
