"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetOrCreateDm } from "@/hooks/useChannels";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/providers/AuthProvider";
import { MessageSquarePlus } from "lucide-react";

export function NewDmDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const { data: users } = useUsers();
  const getOrCreateDm = useGetOrCreateDm();
  const router = useRouter();

  const options = (users ?? []).filter((u) => u.id !== user?.id);

  function handleStart() {
    if (!userId) return;
    getOrCreateDm.mutate(userId, {
      onSuccess: (channel) => {
        setOpen(false);
        setUserId("");
        router.push(`/chat/${channel._id}`);
      },
      onError: () => toast.error("Could not start this conversation."),
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        </DialogHeader>
        {options.length === 0 ? (
          <p className="text-sm text-muted-foreground">No other teammates yet.</p>
        ) : (
          <Select value={userId || undefined} onValueChange={(v) => setUserId(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a teammate..." />
            </SelectTrigger>
            <SelectContent>
              {options.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <DialogFooter>
          <Button
            onClick={handleStart}
            disabled={!userId || getOrCreateDm.isPending}
            className="bg-amber-500 text-stone-900 hover:bg-amber-400"
          >
            {getOrCreateDm.isPending ? "Starting..." : "Start conversation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
