"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, User as UserIcon, Settings, CircleUserRound } from "lucide-react";
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
import { BrandLogo } from "@/components/branding/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { WorkspaceSearch } from "@/components/layout/WorkspaceSearch";

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

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/80 bg-background/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex shrink-0 items-center gap-3 lg:hidden">
        <div className="flex size-9 items-center justify-center overflow-hidden rounded-sm bg-white p-1 shadow-sm ring-1 ring-black/5 dark:bg-sidebar-accent/35 dark:ring-sidebar-border">
          <BrandLogo variant="square" className="h-full w-full" priority />
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-bold tracking-tight">Catalyst</p>
          <p className="text-[10px] font-medium tracking-[0.12em] text-primary uppercase">Ugnexa workspace</p>
        </div>
      </div>
      <div className="hidden items-center gap-2 lg:flex"><span className="size-1.5 rounded-full bg-emerald-500" /><p className="text-xs font-medium text-muted-foreground">Workspace connected</p></div>
      <div className="flex items-center gap-1.5">
        <WorkspaceSearch />
        <ThemeToggle className="lg:hidden" />
        <NotificationBell />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="flex h-9 items-center gap-2 rounded-sm px-2">
                <Avatar className="size-7">
                  <AvatarImage src={user?.avatarUrl ?? undefined} />
                  <AvatarFallback className="bg-primary/15 text-xs text-primary">
                    {user ? initials(user.name) : <UserIcon className="size-3.5" />}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium lg:inline">{user?.name}</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled className="text-xs text-muted-foreground">
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/profile" />}>
              <CircleUserRound className="mr-2 size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/settings" />}>
              <Settings className="mr-2 size-4" />
              Settings
            </DropdownMenuItem>
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
