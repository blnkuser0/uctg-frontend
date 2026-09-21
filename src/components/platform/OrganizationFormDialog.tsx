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
import { useCreateOrganization } from "@/hooks/usePlatform";
import { Plus } from "lucide-react";
import { announceAccountCreated } from "@/lib/accountCreated";
import { AccountCredentials, CredentialsDialog } from "@/components/users/CredentialsDialog";

export function OrganizationFormDialog() {
  const [open, setOpen] = useState(false);
  const [credentials, setCredentials] = useState<AccountCredentials | null>(null);
  const [organizationName, setOrganizationName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const createOrganization = useCreateOrganization();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setOrganizationName("");
      setName("");
      setEmail("");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!organizationName.trim() || !name.trim() || !email.trim()) {
      toast.error("Fill in the organization name and the admin's name and email");
      return;
    }

    createOrganization.mutate(
      { organizationName: organizationName.trim(), name: name.trim(), email: email.trim() },
      {
        onSuccess: (created) => {
          setCredentials(announceAccountCreated(created, "Organization"));
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
    <>
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button className="bg-cyan-600 text-white hover:bg-cyan-500">
            <Plus className="size-4" />
            New organization
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a client organization</DialogTitle>
          <DialogDescription>Creates the workspace and its first admin account together.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1.5">
            <Label htmlFor="orgName">Organization name</Label>
            <Input
              id="orgName"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="e.g. Acme Corp"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="adminName">Admin name</Label>
            <Input id="adminName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jordan Lee" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="adminEmail">Admin email</Label>
            <Input
              id="adminEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@client.com"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            The admin is emailed their login details with the shared temporary password.
          </p>
          <DialogFooter>
            <Button type="submit" disabled={createOrganization.isPending} className="bg-cyan-600 text-white hover:bg-cyan-500">
              {createOrganization.isPending ? "Creating..." : "Create organization"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <CredentialsDialog credentials={credentials} onClose={() => setCredentials(null)} />
    </>
  );
}
