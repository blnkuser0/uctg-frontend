"use client";

import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserFormDialog } from "./UserFormDialog";
import { useAuth } from "@/providers/AuthProvider";
import { useDeactivateUser, useUpdateUser } from "@/hooks/useUsers";
import { User } from "@/types/user";
import { Pencil, Power, PowerOff } from "lucide-react";

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function UserTable({ users }: { users: User[] }) {
  const { user: currentUser } = useAuth();
  const deactivateUser = useDeactivateUser();
  const updateUser = useUpdateUser();

  function handleToggleActive(target: User) {
    const isActive = target.isActive !== false;
    if (isActive) {
      deactivateUser.mutate(target.id, {
        onSuccess: () => toast.success(`${target.name} deactivated`),
        onError: () => toast.error("Could not deactivate this user."),
      });
    } else {
      updateUser.mutate(
        { userId: target.id, input: { isActive: true } },
        {
          onSuccess: () => toast.success(`${target.name} reactivated`),
          onError: () => toast.error("Could not reactivate this user."),
        }
      );
    }
  }

  if (users.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No users yet.</p>;
  }

  return (
    <div className="grid gap-3">
      {users.map((user) => {
        const isActive = user.isActive !== false;
        const isSelf = user.id === currentUser?.id;
        return (
          <div key={user.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="size-9 shrink-0">
                  <AvatarFallback className="bg-cyan-500/20 text-xs text-cyan-700">{initials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="truncate font-semibold">{user.name}</h3>
                    {!isActive && <Badge className="bg-muted font-normal text-muted-foreground">Deactivated</Badge>}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  <Badge className="mt-1.5 bg-cyan-500/15 font-normal text-cyan-700">{user.role.name ?? "No role"}</Badge>
                </div>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <UserFormDialog
                  user={user}
                  trigger={
                    <Button size="icon-sm" variant="outline" aria-label="Edit user">
                      <Pencil className="size-3.5" />
                    </Button>
                  }
                />
                <Button
                  size="icon-sm"
                  variant="outline"
                  disabled={isSelf}
                  title={isSelf ? "You can't deactivate your own account" : undefined}
                  onClick={() => handleToggleActive(user)}
                  aria-label={isActive ? "Deactivate user" : "Reactivate user"}
                >
                  {isActive ? <PowerOff className="size-3.5" /> : <Power className="size-3.5" />}
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
