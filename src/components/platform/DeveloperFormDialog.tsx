"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreatePlatformUser } from "@/hooks/usePlatform";
import { announceAccountCreated } from "@/lib/accountCreated";
import { Plus } from "lucide-react";

export function DeveloperFormDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");

  const createUser = useCreatePlatformUser();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setEmail("");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Enter the developer's email");
      return;
    }

    createUser.mutate(
      { email: email.trim(), isDeveloper: true },
      {
        onSuccess: (created) => {
          announceAccountCreated(created, "Developer");
          setOpen(false);
        },
        onError: (err: unknown) => {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Something went wrong. Please try again.";
          toast.error(message);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button className="bg-cyan-600 text-white hover:bg-cyan-500">
            <Plus className="size-4" />
            New developer
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a developer</DialogTitle>
          <DialogDescription>Adds them to the shared Developers organization and emails them their login details.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1.5">
            <Label htmlFor="devEmail">Email</Label>
            <Input
              id="devEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dev@ugnexa.com"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createUser.isPending} className="bg-cyan-600 text-white hover:bg-cyan-500">
              {createUser.isPending ? "Creating..." : "Create developer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
