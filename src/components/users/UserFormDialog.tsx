"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRoles } from "@/hooks/useRoles";
import { announceAccountCreated } from "@/lib/accountCreated";
import { useCreateUser, useUpdateUser } from "@/hooks/useUsers";
import { User } from "@/types/user";
import { Plus } from "lucide-react";

interface UserFormDialogProps {
  user?: User;
  trigger?: React.ReactElement;
  // Pass `open` to control the dialog from outside (e.g. from a row's actions menu);
  // it then renders no trigger of its own.
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function UserFormDialog({ user, trigger, open: openProp, onOpenChange }: UserFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : internalOpen;
  function setOpen(next: boolean) {
    if (!controlled) setInternalOpen(next);
    onOpenChange?.(next);
  }
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [roleId, setRoleId] = useState(user?.role.id ?? "");

  const { data: roles } = useRoles(open);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const isEditing = !!user;
  const isPending = createUser.isPending || updateUser.isPending;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setName(user?.name ?? "");
      setEmail(user?.email ?? "");
      setRoleId(user?.role.id ?? "");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roleId || (isEditing && !name.trim())) {
      toast.error(isEditing ? "Give the user a name and a role" : "Choose a role for the user");
      return;
    }
    if (!isEditing && !email.trim()) {
      toast.error("Enter the new user's email");
      return;
    }

    const onSuccess = () => {
      toast.success("User updated");
      setOpen(false);
    };
    const onError = (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Something went wrong. Please try again.";
      toast.error(message);
    };

    if (isEditing) {
      updateUser.mutate({ userId: user.id, input: { name: name.trim(), roleId } }, { onSuccess, onError });
    } else {
      createUser.mutate(
        { email: email.trim(), roleId },
        {
          onSuccess: (created) => {
            announceAccountCreated(created, "User");
            setOpen(false);
          },
          onError,
        }
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!controlled && (
        <DialogTrigger
          render={
            trigger ?? (
              <Button className="bg-cyan-600 text-white hover:bg-cyan-500">
                <Plus className="size-4" />
                New user
              </Button>
            )
          }
        />
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit user" : "Create a user"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update their name or role." : "Enter their email and pick a role. We'll email them their login details and the temporary password; they set their own name and password after signing in."}
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1.5">
            <Label htmlFor="userEmail">Email</Label>
            <Input
              id="userEmail"
              type="email"
              value={email}
              disabled={isEditing}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
          </div>
          {isEditing && (
            <div className="grid gap-1.5">
              <Label htmlFor="userName">Name</Label>
              <Input id="userName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mona Member" />
            </div>
          )}
          <div className="grid gap-1.5">
            <Label>Role</Label>
            <Select
              value={roleId || undefined}
              items={(roles ?? []).map((role) => ({ value: role.id, label: role.name }))}
              onValueChange={(v) => setRoleId(v ?? "")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role..." />
              </SelectTrigger>
              <SelectContent>
                {(roles ?? []).map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending} className="bg-cyan-600 text-white hover:bg-cyan-500">
              {isPending ? "Saving..." : isEditing ? "Save changes" : "Create user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
