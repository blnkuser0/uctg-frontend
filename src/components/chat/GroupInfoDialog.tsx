"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Info, LogOut, Search, Trash2, UserPlus, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeleteGroup, useUpdateGroup } from "@/hooks/useChannels";
import { useIsOnline } from "@/hooks/usePresence";
import { useUsers } from "@/hooks/useUsers";
import { avatarGradient, cn } from "@/lib/utils";
import { Channel } from "@/types/channel";
import { OnlineDot } from "./OnlineDot";

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function MemberRow({ id, name, avatarUrl }: { id: string; name: string; avatarUrl?: string | null }) {
  const online = useIsOnline(id);
  return (
    <>
      <span className="relative shrink-0">
        <Avatar className="size-6">
          <AvatarImage src={avatarUrl ?? undefined} />
          <AvatarFallback className={cn("text-[10px] font-medium text-white", avatarGradient(id))}>{initials(name)}</AvatarFallback>
        </Avatar>
        {online && <OnlineDot ringClassName="ring-popover" />}
      </span>
      <span className="min-w-0 flex-1 truncate">{name}</span>
    </>
  );
}

// The full membership+settings panel for an existing group: reachable from the thread header
// (channel.type === "group" only — DMs are fixed two-person and project channels follow the
// project's own membership). Covers what the plain creation dialog can't: renaming, adding or
// removing people after the fact, leaving, and deleting.
export function GroupInfoDialog({ channel, currentUserId }: { channel: Channel; currentUserId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(channel.name ?? "");
  const [addingOpen, setAddingOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { data: users } = useUsers();
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();
  const router = useRouter();

  const memberIds = new Set(channel.memberIds.map((m) => m._id));
  const candidates = (users ?? []).filter((u) => !memberIds.has(u.id));
  const needle = query.trim().toLowerCase();
  const matches = needle
    ? candidates.filter((u) => u.name.toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle))
    : candidates;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setName(channel.name ?? "");
      setAddingOpen(false);
      setQuery("");
      setSelected([]);
      setConfirmingDelete(false);
    }
  }

  function saveName() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === channel.name) return;
    updateGroup.mutate(
      { channelId: channel._id, input: { name: trimmed } },
      { onError: () => toast.error("Could not rename the group.") }
    );
  }

  function toggleCandidate(userId: string) {
    setSelected((current) => (current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]));
  }

  function addSelected() {
    if (selected.length === 0) return;
    updateGroup.mutate(
      { channelId: channel._id, input: { addMemberIds: selected } },
      {
        onSuccess: () => {
          toast.success(selected.length === 1 ? "Member added" : `${selected.length} members added`);
          setSelected([]);
          setQuery("");
          setAddingOpen(false);
        },
        onError: () => toast.error("Could not add them to the group."),
      }
    );
  }

  function removeMember(userId: string, memberName: string) {
    updateGroup.mutate(
      { channelId: channel._id, input: { removeMemberId: userId } },
      {
        onSuccess: () => toast.success(`${memberName} removed from the group`),
        onError: () => toast.error("Could not remove them from the group."),
      }
    );
  }

  function leaveGroup() {
    updateGroup.mutate(
      { channelId: channel._id, input: { removeMemberId: currentUserId } },
      {
        onSuccess: () => {
          setOpen(false);
          router.push("/chat");
        },
        onError: () => toast.error("Could not leave the group."),
      }
    );
  }

  function confirmDelete() {
    deleteGroup.mutate(channel._id, {
      onSuccess: () => {
        setOpen(false);
        router.push("/chat");
      },
      onError: () => toast.error("Could not delete the group."),
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Group info" title="Group info">
            <Info className="size-4" />
          </Button>
        }
      />
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Group info</DialogTitle>
          <DialogDescription>{channel.memberIds.length} members</DialogDescription>
        </DialogHeader>

        {confirmingDelete ? (
          <div className="grid gap-4">
            <p className="text-sm text-muted-foreground">
              Delete <span className="font-medium text-foreground">{channel.name}</span> for everyone? Its messages go
              with it. This can&apos;t be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmingDelete(false)} disabled={deleteGroup.isPending}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={deleteGroup.isPending}>
                {deleteGroup.isPending ? "Deleting..." : "Delete group"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="groupInfoName">Group name</Label>
              <div className="flex gap-2">
                <Input id="groupInfoName" value={name} onChange={(e) => setName(e.target.value)} />
                <Button
                  variant="outline"
                  disabled={!name.trim() || name.trim() === channel.name || updateGroup.isPending}
                  onClick={saveName}
                >
                  Save
                </Button>
              </div>
            </div>

            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label>Members</Label>
                {!addingOpen && (
                  <Button variant="ghost" size="sm" onClick={() => setAddingOpen(true)}>
                    <UserPlus className="size-3.5" />
                    Add
                  </Button>
                )}
              </div>

              {addingOpen && (
                <div className="mb-1 grid gap-2 rounded-lg border border-border p-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      autoFocus
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search teammates to add"
                      className="pl-8"
                    />
                  </div>
                  <div className="grid max-h-36 gap-0.5 overflow-y-auto">
                    {matches.length === 0 ? (
                      <p className="p-1.5 text-xs text-muted-foreground">
                        {candidates.length === 0 ? "Everyone is already in this group." : "No matches."}
                      </p>
                    ) : (
                      matches.map((u) => (
                        <label key={u.id} className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 text-sm hover:bg-muted">
                          <input
                            type="checkbox"
                            className="size-3.5 accent-primary"
                            checked={selected.includes(u.id)}
                            onChange={() => toggleCandidate(u.id)}
                          />
                          <MemberRow id={u.id} name={u.name} avatarUrl={u.avatarUrl} />
                        </label>
                      ))
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setAddingOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={selected.length === 0 || updateGroup.isPending}
                      onClick={addSelected}
                      className="bg-cyan-600 text-white hover:bg-cyan-500"
                    >
                      {updateGroup.isPending ? "Adding..." : `Add${selected.length > 0 ? ` (${selected.length})` : ""}`}
                    </Button>
                  </div>
                </div>
              )}

              <ul className="grid max-h-52 gap-0.5 overflow-y-auto">
                {channel.memberIds.map((member) => {
                  const isSelf = member._id === currentUserId;
                  return (
                    <li key={member._id} className="flex items-center gap-2 rounded-md p-1.5 text-sm">
                      <MemberRow id={member._id} name={member.name} avatarUrl={member.avatarUrl} />
                      {isSelf && <Badge className="bg-muted font-normal text-muted-foreground">You</Badge>}
                      {!isSelf && (
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`Remove ${member.name}`}
                          title="Remove from group"
                          disabled={updateGroup.isPending}
                          onClick={() => removeMember(member._id, member.name)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="size-3.5" />
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-3">
              <Button variant="outline" onClick={leaveGroup} disabled={updateGroup.isPending}>
                <LogOut className="size-4" />
                Leave group
              </Button>
              <Button variant="destructive" onClick={() => setConfirmingDelete(true)}>
                <Trash2 className="size-4" />
                Delete group
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
