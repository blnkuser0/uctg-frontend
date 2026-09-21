"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageSquarePlus, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGetOrCreateDm } from "@/hooks/useChannels";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/providers/AuthProvider";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function NewDmDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [startingId, setStartingId] = useState<string | null>(null);
  const { data: users } = useUsers();
  const getOrCreateDm = useGetOrCreateDm();
  const router = useRouter();

  const teammates = (users ?? []).filter((u) => u.id !== user?.id && u.isActive !== false);
  const needle = query.trim().toLowerCase();
  const matches = needle
    ? teammates.filter((u) => u.name.toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle))
    : teammates;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setQuery("");
  }

  function start(userId: string) {
    if (getOrCreateDm.isPending) return;
    setStartingId(userId);
    getOrCreateDm.mutate(userId, {
      onSuccess: (channel) => {
        setOpen(false);
        router.push(`/chat/${channel._id}`);
      },
      onError: () => toast.error("Could not start this conversation."),
      onSettled: () => setStartingId(null),
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <MessageSquarePlus className="size-4" />
            New message
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New direct message</DialogTitle>
          <DialogDescription>Search for a teammate, then tap their name to start chatting.</DialogDescription>
        </DialogHeader>

        {teammates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No other teammates yet.</p>
        ) : (
          <div className="grid gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && matches.length > 0) {
                    e.preventDefault();
                    start(matches[0].id);
                  }
                }}
                placeholder="Search by name or email"
                aria-label="Search teammates"
                className="pl-9"
              />
            </div>

            <ul className="max-h-72 overflow-y-auto rounded-md border border-border" aria-label="Teammates">
              {matches.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">No teammate matches &ldquo;{query.trim()}&rdquo;.</li>
              ) : (
                matches.map((teammate) => (
                  <li key={teammate.id} className="border-b border-border last:border-b-0">
                    <button
                      type="button"
                      onClick={() => start(teammate.id)}
                      disabled={getOrCreateDm.isPending}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none disabled:opacity-60"
                    >
                      <Avatar className="size-8 shrink-0">
                        <AvatarImage src={teammate.avatarUrl ?? undefined} />
                        <AvatarFallback className="bg-primary/15 text-xs text-primary">{initials(teammate.name)}</AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{teammate.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{teammate.role.name ?? teammate.email}</span>
                      </span>
                      {startingId === teammate.id && <span className="text-xs text-muted-foreground">Starting…</span>}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
