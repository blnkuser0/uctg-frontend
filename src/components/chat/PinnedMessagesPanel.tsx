"use client";

import { Pin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePinnedMessages } from "@/hooks/useMessages";

interface PinnedMessagesPanelProps {
  channelId: string;
  onClose: () => void;
  onJumpToMessage: (messageId: string) => void;
}

// A dropdown under the header, toggled by the pin button next to Search — not a persistent
// banner, since most conversations pin nothing and a banner would just be empty chrome.
export function PinnedMessagesPanel({ channelId, onClose, onJumpToMessage }: PinnedMessagesPanelProps) {
  const { data: pinned, isLoading } = usePinnedMessages(channelId, true);

  return (
    <div className="absolute inset-x-0 top-full z-20 max-h-80 overflow-y-auto border-b border-border bg-popover shadow-lg">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Pin className="size-3.5" />
          Pinned messages
        </span>
        <button type="button" onClick={onClose} aria-label="Close pinned messages" className="text-muted-foreground hover:text-foreground">
          <X className="size-3.5" />
        </button>
      </div>

      {isLoading ? (
        <p className="p-4 text-center text-xs text-muted-foreground">Loading…</p>
      ) : !pinned || pinned.length === 0 ? (
        <p className="p-4 text-center text-xs text-muted-foreground">No pinned messages yet. Hover a message and pin it.</p>
      ) : (
        <ul className="divide-y divide-border">
          {pinned.map((message) => (
            <li key={message._id}>
              <Button
                variant="ghost"
                onClick={() => {
                  onJumpToMessage(message._id);
                  onClose();
                }}
                className="h-auto w-full justify-start rounded-none px-3 py-2 text-left"
              >
                <span className="min-w-0">
                  <span className="block text-xs font-medium">{message.authorName}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {message.message || (message.attachments.length > 0 ? "Sent an attachment" : "")}
                  </span>
                </span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
