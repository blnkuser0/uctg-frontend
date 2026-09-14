"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateGroup } from "@/hooks/useChannels";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/providers/AuthProvider";
import { UsersRound } from "lucide-react";

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function NewGroupDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const { data: users } = useUsers();
  const createGroup = useCreateGroup();
  const router = useRouter();

  const options = (users ?? []).filter((u) => u.id !== user?.id);

  function toggle(userId: string, checked: boolean) {
    setMemberIds(checked ? [...memberIds, userId] : memberIds.filter((id) => id !== userId));
  }

  function handleCreate() {
    if (!name.trim()) {
      toast.error("Give the group a name");
      return;
    }
    createGroup.mutate(
      { name: name.trim(), memberIds },
      {
        onSuccess: (channel) => {
          setOpen(false);
          setName("");
          setMemberIds([]);
          router.push(`/chat/${channel._id}`);
        },
        onError: () => toast.error("Could not create the group."),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <UsersRound className="size-4" />
            New group
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New group</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="groupName">Group name</Label>
            <Input id="groupName" value={name} onChange={(e) => setName(e.target.value)} placeholder="New Group Name" />
          </div>
          <div className="grid gap-1.5">
            <Label>Members</Label>
            <div className="grid max-h-48 gap-1 overflow-y-auto rounded-lg border border-border p-1.5">
              {options.length === 0 && <p className="p-2 text-xs text-muted-foreground">No other teammates yet.</p>}
              {options.map((u) => (
                <label key={u.id} className="flex items-center gap-2 rounded-md p-1.5 text-sm hover:bg-muted">
                  <Checkbox checked={memberIds.includes(u.id)} onCheckedChange={(c) => toggle(u.id, c === true)} />
                  <Avatar className="size-6">
                    <AvatarFallback className="bg-cyan-500/20 text-[10px] text-cyan-700">{initials(u.name)}</AvatarFallback>
                  </Avatar>
                  <span className="cursor-pointer">{u.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={createGroup.isPending}
            className="bg-cyan-600 text-white hover:bg-cyan-500"
          >
            {createGroup.isPending ? "Creating..." : "Create group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
