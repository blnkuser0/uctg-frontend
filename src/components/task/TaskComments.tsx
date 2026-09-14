"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/providers/AuthProvider";
import { useComments, useCreateComment, useUpdateComment, useDeleteComment } from "@/hooks/useComments";
import { useUsers } from "@/hooks/useUsers";
import { formatClockDateTime } from "@/lib/utils";
import { AtSign, Pencil, Trash2 } from "lucide-react";

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function timeAgo(iso: string): string {
  return formatClockDateTime(iso);
}

export function TaskComments({ taskId, memberIds }: { taskId: string; memberIds: string[] }) {
  const { user } = useAuth();
  const { data: comments } = useComments(taskId);
  const { data: users } = useUsers();
  const createComment = useCreateComment(taskId);
  const updateComment = useUpdateComment(taskId);
  const deleteComment = useDeleteComment(taskId);

  const [message, setMessage] = useState("");
  const [mentions, setMentions] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const members = (users ?? []).filter((u) => memberIds.includes(u.id) && u.id !== user?.id);

  function toggleMention(userId: string, checked: boolean) {
    setMentions(checked ? [...mentions, userId] : mentions.filter((id) => id !== userId));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    createComment.mutate(
      { message: message.trim(), mentions },
      {
        onSuccess: () => {
          setMessage("");
          setMentions([]);
        },
        onError: () => toast.error("Could not post the comment."),
      }
    );
  }

  function handleSaveEdit(commentId: string) {
    if (!editingText.trim()) return;
    updateComment.mutate(
      { commentId, message: editingText.trim() },
      { onSuccess: () => setEditingId(null), onError: () => toast.error("Could not save the edit.") }
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3">
        {(comments ?? []).map((comment) => (
          <div key={comment._id} className="flex gap-2.5">
            <Avatar className="size-7 shrink-0">
              <AvatarFallback className="bg-cyan-500/20 text-[10px] text-cyan-700">{initials(comment.authorName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{comment.authorName}</span>
                <span className="text-[11px] text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                {comment.isEdited && <span className="text-[11px] text-muted-foreground">(edited)</span>}
              </div>
              {editingId === comment._id ? (
                <div className="mt-1 grid gap-1.5">
                  <Textarea rows={2} value={editingText} onChange={(e) => setEditingText(e.target.value)} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSaveEdit(comment._id)}>
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-0.5 whitespace-pre-wrap text-sm">{comment.message}</p>
              )}
              {comment.userId === user?.id && editingId !== comment._id && (
                <div className="mt-1 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(comment._id);
                      setEditingText(comment.message);
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button onClick={() => deleteComment.mutate(comment._id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="grid gap-2">
        <Textarea rows={3} placeholder="Write a comment..." value={message} onChange={(e) => setMessage(e.target.value)} />
        <div className="flex items-center justify-between">
          <Popover>
            <PopoverTrigger
              render={
                <Button type="button" size="sm" variant="outline">
                  <AtSign className="size-3.5" />
                  Mention{mentions.length > 0 ? ` (${mentions.length})` : ""}
                </Button>
              }
            />
            <PopoverContent className="w-56 p-2" align="start">
              <div className="grid gap-1.5">
                {members.length === 0 && <p className="p-2 text-xs text-muted-foreground">No other members yet.</p>}
                {members.map((u) => (
                  <label key={u.id} className="flex items-center gap-2 rounded-md p-1.5 text-sm hover:bg-muted">
                    <Checkbox checked={mentions.includes(u.id)} onCheckedChange={(c) => toggleMention(u.id, c === true)} />
                    <Label className="cursor-pointer font-normal">{u.name}</Label>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Button type="submit" size="sm" disabled={createComment.isPending} className="bg-cyan-600 text-white hover:bg-cyan-500">
            Post
          </Button>
        </div>
      </form>
    </div>
  );
}
