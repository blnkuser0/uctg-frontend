"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatClockDateTime } from "@/lib/utils";
import { Message } from "@/types/message";
import { FileIcon, Pencil, Trash2 } from "lucide-react";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  onUpdate: (messageId: string, text: string) => void;
  onDelete: (messageId: string) => void;
}

export function MessageItem({ message, isOwn, onUpdate, onDelete }: MessageItemProps) {
  const [editing, setEditing] = useState(false);
  const [editingText, setEditingText] = useState(message.message);

  function handleSave() {
    if (!editingText.trim()) return;
    onUpdate(message._id, editingText.trim());
    setEditing(false);
  }

  return (
    <div className="flex gap-2.5">
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className="bg-amber-500/20 text-[10px] text-amber-700">{initials(message.authorName)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">{message.authorName}</span>
          <span className="text-[11px] text-muted-foreground">{formatClockDateTime(message.createdAt)}</span>
          {message.isEdited && <span className="text-[11px] text-muted-foreground">(edited)</span>}
        </div>

        {editing ? (
          <div className="mt-1 grid gap-1.5">
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
          <>
            {message.message && <p className="mt-0.5 whitespace-pre-wrap text-sm">{message.message}</p>}
            {message.attachments.length > 0 && (
              <div className="mt-1.5 grid gap-1.5">
                {message.attachments.map((file) => (
                  <a
                    key={file.fileKey}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex max-w-xs items-center gap-2 rounded-lg border border-border p-2 text-sm hover:bg-muted"
                  >
                    <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">{file.originalName}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatSize(file.size)}</span>
                  </a>
                ))}
              </div>
            )}
          </>
        )}

        {isOwn && !editing && (
          <div className="mt-1 flex gap-2">
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
          </div>
        )}
      </div>
    </div>
  );
}
