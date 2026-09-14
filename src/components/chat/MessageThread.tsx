"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { MessageComposer } from "./MessageComposer";
import { MessageItem } from "./MessageItem";
import { getChannelDisplayName } from "./channelDisplay";
import { useChannelSocket } from "@/hooks/useChannelSocket";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useMarkChannelRead } from "@/hooks/useChannels";
import { useAddAttachments, useDeleteMessage, useMessages, useSendMessage, useUpdateMessage } from "@/hooks/useMessages";
import { Channel } from "@/types/channel";

export function MessageThread({ channel, currentUserId }: { channel: Channel; currentUserId: string }) {
  const { data: messages, isLoading } = useMessages(channel._id);
  const sendMessage = useSendMessage(channel._id);
  const updateMessage = useUpdateMessage(channel._id);
  const deleteMessage = useDeleteMessage(channel._id);
  const addAttachments = useAddAttachments(channel._id);
  const markRead = useMarkChannelRead();
  const bottomRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const otherMembers = channel.memberIds.filter((m) => m._id !== currentUserId);

  useChannelSocket(channel._id);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages?.length]);

  useEffect(() => {
    markRead.mutate(channel._id);
    // Only re-mark-read when the channel changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel._id]);

  function handleSend(text: string, mentions: string[]) {
    sendMessage.mutate({ message: text, mentions }, { onError: () => toast.error("Could not send that message.") });
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

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border p-3">
        {isMobile && (
          <Link href="/chat" className="text-muted-foreground hover:text-foreground" aria-label="Back to conversations">
            <ChevronLeft className="size-5" />
          </Link>
        )}
        <h2 className="text-sm font-semibold">{getChannelDisplayName(channel, currentUserId)}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="size-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="grid gap-3">
            {messages.map((message) => (
              <MessageItem
                key={message._id}
                message={message}
                isOwn={message.userId === currentUserId}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">No messages yet — say hello.</p>
        )}
      </div>

      <MessageComposer
        members={channel.type === "dm" ? [] : otherMembers}
        onSend={handleSend}
        onAttach={handleAttach}
        isSending={sendMessage.isPending}
        isUploading={addAttachments.isPending}
      />
    </div>
  );
}
