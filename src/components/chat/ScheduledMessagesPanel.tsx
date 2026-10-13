"use client";

import { CalendarClock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteMessage, useScheduledMessages } from "@/hooks/useMessages";

export function ScheduledMessagesPanel({ channelId, onClose }: { channelId: string; onClose: () => void }) {
  const { data: messages, isLoading } = useScheduledMessages(channelId, true);
  const cancel = useDeleteMessage(channelId);

  return (
    <aside className="absolute inset-x-0 top-[57px] z-10 max-h-72 overflow-y-auto border-b border-border bg-popover p-3 shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold"><CalendarClock className="size-4 text-primary" />Scheduled messages</div>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close scheduled messages"><X className="size-4" /></Button>
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : messages?.length ? (
        <div className="grid gap-2">
          {messages.map((message) => (
            <div key={message._id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-2.5">
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm">{message.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{message.scheduledFor ? new Date(message.scheduledFor).toLocaleString() : "Pending"}</p>
              </div>
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => cancel.mutate(message._id)} disabled={cancel.isPending}>Cancel</Button>
            </div>
          ))}
        </div>
      ) : <p className="py-2 text-sm text-muted-foreground">No scheduled messages in this conversation.</p>}
    </aside>
  );
}
