"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ListChecks, Bell, Clock, CalendarDays, CalendarCheck, ShieldCheck, Users, MessagesSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { PERMISSIONS } from "@/types/role";

const NAV_ITEMS = [
  { href: "/projects", label: "Projects", icon: LayoutGrid },
  { href: "/chat", label: "Chat", icon: MessagesSquare },
  { href: "/timeproof", label: "Timeproof", icon: Clock },
  { href: "/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/leaves", label: "Leaves", icon: CalendarDays },
  { href: "/my-tasks", label: "My Tasks", icon: ListChecks },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const canManageUsers = user?.role.permissions.includes(PERMISSIONS.USERS_MANAGE);
  const canManageRoles = user?.role.permissions.includes(PERMISSIONS.ROLES_MANAGE);

  const items = [
    ...NAV_ITEMS,
    ...(canManageUsers ? [{ href: "/users", label: "Users", icon: Users }] : []),
    ...(canManageRoles ? [{ href: "/roles", label: "Roles", icon: ShieldCheck }] : []),
  ];

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500 text-xs font-bold text-stone-900">
          UC
        </div>
        <span className="text-sm font-semibold">Ugnexa Catalyst</span>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-amber-500/15 text-amber-600"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
