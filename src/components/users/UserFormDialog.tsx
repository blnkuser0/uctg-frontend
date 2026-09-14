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
import { useCreateUser, useUpdateUser } from "@/hooks/useUsers";
import { User } from "@/types/user";
import { Plus } from "lucide-react";

interface UserFormDialogProps {
  user?: User;
  trigger?: React.ReactElement;
}

export function UserFormDialog({ user, trigger }: UserFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
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
      setPassword("");
      setRoleId(user?.role.id ?? "");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !roleId) {
      toast.error("Give the user a name and a role");
      return;
    }
    if (!isEditing && (!email.trim() || password.length < 8)) {
      toast.error("Email and an 8+ character password are required");
      return;
    }

    const onSuccess = () => {
      toast.success(isEditing ? "User updated" : "User created");
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
      createUser.mutate({ name: name.trim(), email: email.trim(), password, roleId }, { onSuccess, onError });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit user" : "Create a user"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update their name or role." : "Add a teammate and assign them a role."}
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1.5">
            <Label htmlFor="userName">Name</Label>
            <Input id="userName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mona Member" />
          </div>
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
          {!isEditing && (
            <div className="grid gap-1.5">
              <Label htmlFor="userPassword">Password</Label>
              <Input
                id="userPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
          )}
          <div className="grid gap-1.5">
            <Label>Role</Label>
            <Select value={roleId || undefined} onValueChange={(v) => setRoleId(v ?? "")}>
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
