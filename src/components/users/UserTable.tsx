"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IdCardDialog } from "@/components/idcard/IdCardDialog";
import { useAuth } from "@/providers/AuthProvider";
import { useDeactivateUser, useUpdateUser } from "@/hooks/useUsers";
import { User } from "@/types/user";
import { IdCard, KeyRound, MoreVertical, Pencil, Power, PowerOff, Trash2 } from "lucide-react";
import { AccountCredentials, CredentialsDialog } from "./CredentialsDialog";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { ResetPasswordDialog } from "./ResetPasswordDialog";
import { UserFormDialog } from "./UserFormDialog";

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

type RowAction = { kind: "id" | "edit" | "reset" | "delete"; user: User };

export function UserTable({ users, emptyMessage }: { users: User[]; emptyMessage?: string }) {
  const { user: currentUser } = useAuth();
  const deactivateUser = useDeactivateUser();
  const updateUser = useUpdateUser();
  // One dialog of each kind for the whole table, opened from a row's menu.
  const [action, setAction] = useState<RowAction | null>(null);
  const [credentials, setCredentials] = useState<AccountCredentials | null>(null);
  const closeAction = (open: boolean) => {
    if (!open) setAction(null);
  };

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
    return <p className="py-10 text-center text-sm text-muted-foreground">{emptyMessage ?? "No users yet."}</p>;
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isActive = user.isActive !== false;
              const isSelf = user.id === currentUser?.id;
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar className="size-8 shrink-0">
                        <AvatarFallback className="bg-cyan-500/20 text-xs text-cyan-700">{initials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="truncate font-medium">{user.name}</span>
                          {!isActive && <Badge className="bg-muted font-normal text-muted-foreground">Deactivated</Badge>}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge className="bg-cyan-500/15 font-normal text-cyan-700">{user.role.name ?? "No role"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button size="icon-sm" variant="ghost" className="ml-auto" aria-label={`Actions for ${user.name}`}>
                            <MoreVertical className="size-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="min-w-44">
                        <DropdownMenuItem onClick={() => setAction({ kind: "id", user })}>
                          <IdCard className="size-4" />
                          View ID card
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setAction({ kind: "edit", user })}>
                          <Pencil className="size-4" />
                          Edit user
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={isSelf} onClick={() => handleToggleActive(user)}>
                          {isActive ? <PowerOff className="size-4" /> : <Power className="size-4" />}
                          {isActive ? "Deactivate" : "Reactivate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={isSelf || user.isSuperAdmin === true}
                          onClick={() => setAction({ kind: "reset", user })}
                        >
                          <KeyRound className="size-4" />
                          Reset password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={isSelf || user.isSuperAdmin === true}
                          onClick={() => setAction({ kind: "delete", user })}
                        >
                          <Trash2 className="size-4" />
                          Delete user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {action?.kind === "id" && (
        <IdCardDialog userId={action.user.id} userName={action.user.name} open onOpenChange={closeAction} />
      )}
      {action?.kind === "edit" && <UserFormDialog key={action.user.id} user={action.user} open onOpenChange={closeAction} />}
      {action?.kind === "reset" && (
        <ResetPasswordDialog user={action.user} open onOpenChange={closeAction} onCredentials={setCredentials} />
      )}
      {action?.kind === "delete" && <DeleteUserDialog user={action.user} open onOpenChange={closeAction} />}
      <CredentialsDialog credentials={credentials} onClose={() => setCredentials(null)} title="Password reset" />
    </>
  );
}
