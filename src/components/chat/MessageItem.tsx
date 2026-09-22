"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { avatarGradient, cn, formatClockTime } from "@/lib/utils";
import { Message } from "@/types/message";
import { FileIcon, Pencil, Pin, Reply, SmilePlus, Trash2 } from "lucide-react";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

// A short, fixed set rather than a full emoji picker — covers the common cases without pulling
// in an emoji-data dependency. Tapping one already on a message toggles it off (see
// message.service.ts's reactToMessage), so this same row doubles as "remove my reaction."
const QUICK_REACTIONS = ["👍", "❤️", "😂", "🎉", "👏", "🙏"];

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  currentUserId: string;
  // False when this message immediately follows another one from the same sender (within a few
  // minutes) — the avatar/name/timestamp collapse away for a tighter, "burst of messages" look,
  // the way every mainstream chat app groups consecutive sends.
  showHeader: boolean;
  onUpdate: (messageId: string, text: string) => void;
  onDelete: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onTogglePin: (messageId: string) => void;
  onReply: (message: Message) => void;
  onJumpToMessage: (messageId: string) => void;
  highlighted?: boolean;
}

export function MessageItem({
  message,
  isOwn,
  currentUserId,
  showHeader,
  onUpdate,
  onDelete,
  onReact,
  onTogglePin,
  onReply,
  onJumpToMessage,
  highlighted,
}: MessageItemProps) {
  const [editing, setEditing] = useState(false);
  const [editingText, setEditingText] = useState(message.message);
  const [pickerOpen, setPickerOpen] = useState(false);

  function handleSave() {
    if (!editingText.trim()) return;
    onUpdate(message._id, editingText.trim());
    setEditing(false);
  }

  function pickReaction(emoji: string) {
    onReact(message._id, emoji);
    setPickerOpen(false);
  }

  const actionRow = !editing && (
    // Always visible rather than hover-revealed: hover doesn't exist on touch, and these are the
    // only way to react, reply, or pin — hiding them there would mean phone/tablet users (and
    // the installed PWA) simply couldn't use those actions at all.
    <div className={cn("mt-1 flex items-center gap-2", isOwn && "flex-row-reverse")}>
      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
        <PopoverTrigger
          render={
            <button className="text-muted-foreground hover:text-foreground" aria-label="Add reaction" title="Add reaction">
              <SmilePlus className="size-3.5" />
            </button>
          }
        />
        <PopoverContent className="flex w-auto gap-1 p-1.5" align={isOwn ? "end" : "start"}>
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => pickReaction(emoji)}
              className="rounded-md p-1 text-base hover:bg-muted"
              aria-label={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </PopoverContent>
      </Popover>
      <button onClick={() => onReply(message)} className="text-muted-foreground hover:text-foreground" aria-label="Reply">
        <Reply className="size-3.5" />
      </button>
      <button
        onClick={() => onTogglePin(message._id)}
        className={cn("text-muted-foreground hover:text-foreground", message.pinnedAt && "text-amber-500 hover:text-amber-600")}
        aria-label={message.pinnedAt ? "Unpin message" : "Pin message"}
        title={message.pinnedAt ? "Unpin" : "Pin"}
      >
        <Pin className="size-3.5" />
      </button>
      {isOwn && (
        <>
          <button
            onClick={() => {
              setEditing(true);
              setEditingText(message.message);
            }}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Edit message"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            onClick={() => onDelete(message._id)}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Delete message"
          >
            <Trash2 className="size-3.5" />
          </button>
        </>
      )}
    </div>
  );

  return (
    <div
      id={`message-${message._id}`}
      className={cn("-mx-1.5 flex gap-2.5 rounded-lg px-1.5 py-0.5", isOwn && "flex-row-reverse", highlighted && "catalyst-message-highlight")}
    >
      <div className="w-8 shrink-0">
        {showHeader && (
          <Avatar className="size-8">
            <AvatarFallback className={cn("text-[10px] font-medium text-white", avatarGradient(message.userId))}>
              {initials(message.authorName)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      <div className={cn("flex min-w-0 flex-1 flex-col", isOwn && "items-end")}>
        {showHeader && (
          <div className={cn("mb-0.5 flex items-baseline gap-2", isOwn && "flex-row-reverse")}>
            {!isOwn && <span className="text-sm font-medium">{message.authorName}</span>}
            <span className="text-[11px] text-muted-foreground">{formatClockTime(message.createdAt)}</span>
            {message.isEdited && <span className="text-[11px] text-muted-foreground">(edited)</span>}
            {message.pinnedAt && <Pin className="size-3 shrink-0 fill-current text-amber-500" aria-label="Pinned" />}
          </div>
        )}

        {message.replyPreview && (
          <button
            type="button"
            onClick={() => onJumpToMessage(message.replyPreview!._id)}
            className="mb-1 flex max-w-full items-start gap-1.5 rounded-md border-l-2 border-border bg-muted/40 px-2 py-1 text-left text-xs hover:bg-muted"
          >
            <Reply className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
            <span className="min-w-0 truncate">
              <span className="font-medium text-foreground">{message.replyPreview.authorName}</span>{" "}
              <span className="text-muted-foreground">
                {message.replyPreview.isDeleted ? "Original message deleted" : message.replyPreview.message}
              </span>
            </span>
          </button>
        )}

        {editing ? (
          <div className="grid w-full gap-1.5">
            <Textarea rows={2} value={editingText} onChange={(e) => setEditingText(e.target.value)} />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className={cn("flex w-fit max-w-[min(80%,34rem)] flex-col gap-1.5", isOwn && "items-end")}>
            {message.message && (
              <div
                className={cn(
                  "rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap",
                  isOwn
                    ? "rounded-br-md bg-gradient-to-br from-primary to-primary/85 text-primary-foreground shadow-md shadow-primary/20"
                    : "rounded-bl-md border border-border bg-card shadow-sm"
                )}
              >
                {message.message}
              </div>
            )}
            {message.attachments.length > 0 && (
              <div className="grid gap-1.5">
                {message.attachments.map((file) => (
                  <a
                    key={file.fileKey}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex max-w-xs items-center gap-2 rounded-xl border border-border bg-card p-2 text-sm shadow-sm hover:bg-muted"
                  >
                    <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">{file.originalName}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatSize(file.size)}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {message.reactions.length > 0 && (
          <div className={cn("mt-1.5 flex flex-wrap gap-1", isOwn && "justify-end")}>
            {message.reactions.map((r) => {
              const reacted = r.userIds.includes(currentUserId);
              return (
                <button
                  key={r.emoji}
                  type="button"
                  onClick={() => onReact(message._id, r.emoji)}
                  title={r.userIds.length === 1 && reacted ? "You" : `${r.userIds.length} reacted`}
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs transition-colors",
                    reacted ? "border-primary/50 bg-primary/15 text-primary" : "border-border bg-muted/50 hover:bg-muted"
                  )}
                >
                  <span>{r.emoji}</span>
                  <span className="text-[10px] font-medium">{r.userIds.length}</span>
                </button>
              );
            })}
          </div>
        )}

        {actionRow}
      </div>
    </div>
  );
}
