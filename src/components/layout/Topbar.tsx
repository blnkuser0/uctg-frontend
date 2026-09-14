"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LogOut, User as UserIcon, ShieldCheck, Users, CalendarCheck, MessagesSquare, Settings } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PERMISSIONS } from "@/types/role";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const canManageUsers = user?.role.permissions.includes(PERMISSIONS.USERS_MANAGE);
  const canManageRoles = user?.role.permissions.includes(PERMISSIONS.ROLES_MANAGE);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6">
      <div className="md:hidden flex items-center gap-2">
        <Image
          src="/assets/branding/logo-square.jpg"
          alt="Ugnexa Catalyst"
          width={28}
          height={28}
          className="size-7 shrink-0 rounded-lg"
        />
        <span className="text-sm font-semibold">Ugnexa Catalyst</span>
      </div>
      <div className="hidden md:block" />
      <div className="flex items-center gap-1">
        <NotificationBell />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="size-7">
                  <AvatarImage src={user?.avatarUrl ?? undefined} />
                  <AvatarFallback className="bg-cyan-500/20 text-xs text-cyan-700">
                    {user ? initials(user.name) : <UserIcon className="size-3.5" />}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">{user?.name}</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled className="text-xs text-muted-foreground">
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/settings" />}>
              <Settings className="mr-2 size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/chat" className="md:hidden" />}>
              <MessagesSquare className="mr-2 size-4" />
              Chat
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/attendance" className="md:hidden" />}>
              <CalendarCheck className="mr-2 size-4" />
              Attendance
            </DropdownMenuItem>
            {canManageUsers && (
              <DropdownMenuItem render={<Link href="/users" className="md:hidden" />}>
                <Users className="mr-2 size-4" />
                Users
              </DropdownMenuItem>
            )}
            {canManageRoles && (
              <DropdownMenuItem render={<Link href="/roles" className="md:hidden" />}>
                <ShieldCheck className="mr-2 size-4" />
                Roles
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
