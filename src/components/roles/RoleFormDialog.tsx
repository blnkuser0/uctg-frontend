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
import { PermissionChecklist } from "./PermissionChecklist";
import { useCreateRole, useUpdateRole } from "@/hooks/useRoles";
import { Permission, Role } from "@/types/role";
import { Plus } from "lucide-react";

interface RoleFormDialogProps {
  role?: Role;
  trigger?: React.ReactElement;
}

export function RoleFormDialog({ role, trigger }: RoleFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(role?.name ?? "");
  const [permissions, setPermissions] = useState<Permission[]>(role?.permissions ?? []);

  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const isEditing = !!role;
  const isPending = createRole.isPending || updateRole.isPending;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setName(role?.name ?? "");
      setPermissions(role?.permissions ?? []);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Give the role a name");
      return;
    }

    const onSuccess = () => {
      toast.success(isEditing ? "Role updated" : "Role created");
      setOpen(false);
    };
    const onError = (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Something went wrong. Please try again.";
      toast.error(message);
    };

    if (isEditing) {
      updateRole.mutate({ roleId: role.id, input: { name, permissions } }, { onSuccess, onError });
    } else {
      createRole.mutate({ name, permissions }, { onSuccess, onError });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button className="bg-amber-500 text-stone-900 hover:bg-amber-400">
              <Plus className="size-4" />
              New Role
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit role" : "Create a role"}</DialogTitle>
          <DialogDescription>Pick exactly what this role is allowed to do.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1.5">
            <Label htmlFor="roleName">Role name</Label>
            <Input id="roleName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Supervisor" />
          </div>
          <div className="grid gap-1.5">
            <Label>Permissions</Label>
            <PermissionChecklist selected={permissions} onChange={setPermissions} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending} className="bg-amber-500 text-stone-900 hover:bg-amber-400">
              {isPending ? "Saving..." : isEditing ? "Save changes" : "Create role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
