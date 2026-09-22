"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronLeft, Pin, Search } from "lucide-react";
import { ChatSearchPanel } from "./ChatSearchPanel";
import { GroupInfoDialog } from "./GroupInfoDialog";
import { MessageComposer } from "./MessageComposer";
import { MessageItem } from "./MessageItem";
import { PinnedMessagesPanel } from "./PinnedMessagesPanel";
import { TypingIndicator } from "./TypingIndicator";
import { getChannelDisplayName } from "./channelDisplay";
import { Button } from "@/components/ui/button";
import { useChannelSocket } from "@/hooks/useChannelSocket";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useMarkChannelRead } from "@/hooks/useChannels";
import { useIsOnline } from "@/hooks/usePresence";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import {
  useAddAttachments,
  useDeleteMessage,
  useMessages,
  useReactToMessage,
  useSendMessage,
  useTogglePinMessage,
  useUpdateMessage,
} from "@/hooks/useMessages";
import { formatDayLabel, toPhDateKey } from "@/lib/utils";
import { Channel } from "@/types/channel";
import { Message } from "@/types/message";

type OverlayPanel = "none" | "search" | "pinned";

// Consecutive messages from the same sender within this window collapse into one visual
// "burst" — avatar/name/timestamp only show once, matching how every mainstream chat app groups
// a quick back-to-back exchange instead of repeating the header on every line.
const GROUP_WINDOW_MS = 5 * 60 * 1000;

type Row =
  | { kind: "divider"; key: string; label: string }
  | { kind: "message"; key: string; message: Message; showHeader: boolean };

function buildRows(messages: Message[]): Row[] {
  const rows: Row[] = [];
  let prevMessage: Message | null = null;
  let prevDayKey: string | null = null;

  for (const message of messages) {
    const dayKey = toPhDateKey(new Date(message.createdAt));
    let showHeader = true;

    if (dayKey !== prevDayKey) {
      rows.push({ kind: "divider", key: `divider-${dayKey}`, label: formatDayLabel(message.createdAt) });
    } else if (prevMessage && prevMessage.userId === message.userId) {
      const gapMs = new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime();
      if (gapMs < GROUP_WINDOW_MS) showHeader = false;
    }

    rows.push({ kind: "message", key: message._id, message, showHeader });
    prevMessage = message;
    prevDayKey = dayKey;
  }

  return rows;
}

export function MessageThread({ channel, currentUserId }: { channel: Channel; currentUserId: string }) {
  const { data: messages, isLoading } = useMessages(channel._id);
  const sendMessage = useSendMessage(channel._id);
  const updateMessage = useUpdateMessage(channel._id);
  const deleteMessage = useDeleteMessage(channel._id);
  const addAttachments = useAddAttachments(channel._id);
  const reactToMessage = useReactToMessage(channel._id);
  const togglePinMessage = useTogglePinMessage(channel._id);
  const markRead = useMarkChannelRead();
  const bottomRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [panel, setPanel] = useState<OverlayPanel>("none");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const otherMembers = channel.memberIds.filter((m) => m._id !== currentUserId);
  const otherDmMember = channel.type === "dm" ? (channel.memberIds.find((m) => m._id !== currentUserId) ?? null) : null;
  const otherDmOnline = useIsOnline(otherDmMember?._id);

  useChannelSocket(channel._id);
  const { typingNames, notifyTyping, notifyStopTyping } = useTypingIndicator(channel._id, currentUserId);

  const rows = useMemo(() => (messages ? buildRows(messages) : []), [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages?.length]);

  useEffect(() => {
    // replyTo/panel need no reset here — MessageThread is remounted per channel (see the `key`
    // on its caller), so this only ever runs once per conversation anyway.
    markRead.mutate(channel._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel._id]);

  function togglePanel(next: Exclude<OverlayPanel, "none">) {
    setPanel((current) => (current === next ? "none" : next));
  }

  function handleSend(text: string, mentions: string[], replyToId?: string) {
    notifyStopTyping();
    sendMessage.mutate({ message: text, mentions, replyToId }, { onError: () => toast.error("Could not send that message.") });
  }

  function handleAttach(files: File[]) {
    addAttachments.mutate({ files }, { onError: () => toast.error("Could not upload the file(s).") });
  }

  function handleUpdate(messageId: string, text: string) {
    updateMessage.mutate({ messageId, message: text }, { onError: () => toast.error("Could not save the edit.") });
  }

  function handleDelete(messageId: string) {
    deleteMessage.mutate(messageId, { onError: () => toast.error("Could not delete this message.") });
  }

  function handleReact(messageId: string, emoji: string) {
    reactToMessage.mutate({ messageId, emoji }, { onError: () => toast.error("Could not add that reaction.") });
  }

  function handleTogglePin(messageId: string) {
    togglePinMessage.mutate(messageId, { onError: () => toast.error("Could not update the pin.") });
  }

  function handleJumpToMessage(messageId: string) {
    const el = document.getElementById(`message-${messageId}`);
    if (!el) {
      toast("That message is further up — keep scrolling to find it.");
      return;
    }
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    setHighlightedId(messageId);
    // Matches globals.css's catalyst-message-flash animation duration (2.2s).
    setTimeout(() => setHighlightedId((current) => (current === messageId ? null : current)), 2200);
  }

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex items-center gap-1.5 border-b border-border p-3">
        {isMobile && (
          <Link href="/chat" className="text-muted-foreground hover:text-foreground" aria-label="Back to conversations">
            <ChevronLeft className="size-5" />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold">{getChannelDisplayName(channel, currentUserId)}</h2>
          {otherDmMember && (
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              {otherDmOnline && <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />}
              {otherDmOnline ? "Online" : "Offline"}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => togglePanel("pinned")}
          aria-label="Pinned messages"
          title="Pinned messages"
          className={panel === "pinned" ? "bg-muted" : undefined}
        >
          <Pin className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => togglePanel("search")}
          aria-label="Search this conversation"
          title="Search"
          className={panel === "search" ? "bg-muted" : undefined}
        >
          <Search className="size-4" />
        </Button>
        {channel.type === "group" && <GroupInfoDialog channel={channel} currentUserId={currentUserId} />}
      </div>

      {panel === "pinned" && (
        <PinnedMessagesPanel channelId={channel._id} onClose={() => setPanel("none")} onJumpToMessage={handleJumpToMessage} />
      )}
      {panel === "search" && (
        <ChatSearchPanel channelId={channel._id} onClose={() => setPanel("none")} onJumpToMessage={handleJumpToMessage} />
      )}

      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : rows.length > 0 ? (
          <div className="grid gap-0.5">
            {rows.map((row) =>
              row.kind === "divider" ? (
                <div key={row.key} className="my-3 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="shrink-0 text-[11px] font-medium text-muted-foreground">{row.label}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              ) : (
                <div key={row.key} className={row.showHeader ? "mt-3 first:mt-0" : "mt-0.5"}>
                  <MessageItem
                    message={row.message}
                    isOwn={row.message.userId === currentUserId}
                    currentUserId={currentUserId}
                    showHeader={row.showHeader}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onReact={handleReact}
                    onTogglePin={handleTogglePin}
                    onReply={setReplyTo}
                    onJumpToMessage={handleJumpToMessage}
                    highlighted={highlightedId === row.message._id}
                  />
                </div>
              )
            )}
            <div ref={bottomRef} />
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">No messages yet — say hello.</p>
        )}
      </div>

      <TypingIndicator names={typingNames} />

      <MessageComposer
        members={channel.type === "dm" ? [] : otherMembers}
        onSend={handleSend}
        onAttach={handleAttach}
        isSending={sendMessage.isPending}
        isUploading={addAttachments.isPending}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        onTyping={notifyTyping}
        onStopTyping={notifyStopTyping}
      />
    </div>
  );
}
