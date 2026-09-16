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
import { Plus } from "lucide-react";

export function DeveloperFormDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const createUser = useCreatePlatformUser();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setName("");
      setEmail("");
      setPassword("");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 8) {
      toast.error("Name, email, and an 8+ character password are required");
      return;
    }

    createUser.mutate(
      { name: name.trim(), email: email.trim(), password, isDeveloper: true },
      {
        onSuccess: () => {
          toast.success("Developer created");
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
          <DialogDescription>Adds them to the shared Developers organization.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1.5">
            <Label htmlFor="devName">Name</Label>
            <Input id="devName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dana Dev" />
          </div>
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
          <div className="grid gap-1.5">
            <Label htmlFor="devPassword">Password</Label>
            <Input
              id="devPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
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
