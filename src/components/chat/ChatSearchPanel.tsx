"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChannelSearch } from "@/hooks/useMessages";

interface ChatSearchPanelProps {
  channelId: string;
  onClose: () => void;
  onJumpToMessage: (messageId: string) => void;
}

export function ChatSearchPanel({ channelId, onClose, onJumpToMessage }: ChatSearchPanelProps) {
  const [query, setQuery] = useState("");
  const { results, isSearching, search, clear } = useChannelSearch(channelId);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      clear();
      return;
    }
    // Debounced so every keystroke doesn't hit the server.
    const timer = setTimeout(() => void search(trimmed), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="absolute inset-x-0 top-full z-20 max-h-96 overflow-y-auto border-b border-border bg-popover shadow-lg">
      <div className="flex items-center gap-2 border-b border-border p-2">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          placeholder="Search this conversation..."
          className="border-0 shadow-none focus-visible:ring-0"
        />
        <button type="button" onClick={onClose} aria-label="Close search" className="shrink-0 text-muted-foreground hover:text-foreground">
          <X className="size-4" />
        </button>
      </div>

      {isSearching ? (
        <p className="p-4 text-center text-xs text-muted-foreground">Searching…</p>
      ) : query.trim() && results?.length === 0 ? (
        <p className="p-4 text-center text-xs text-muted-foreground">No messages match &ldquo;{query.trim()}&rdquo;.</p>
      ) : results && results.length > 0 ? (
        <ul className="divide-y divide-border">
          {results.map((message) => (
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
                  <span className="block text-xs font-medium">
                    {message.authorName} <span className="font-normal text-muted-foreground">{new Date(message.createdAt).toLocaleDateString()}</span>
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{message.message}</span>
                </span>
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
