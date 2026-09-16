"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, CalendarDays, ChevronLeft, ChevronRight, CircleUserRound, Clock, Crown, Gauge, LayoutGrid, ListChecks, MessagesSquare, Settings, ShieldCheck, Users } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { PERMISSIONS } from "@/types/role";

type NavigationTone = "blue" | "violet" | "amber" | "green" | "coral";
type NavigationItem = { href: string; label: string; meta: string; icon: typeof Gauge; tone: NavigationTone };

const WORKSPACE_ITEMS = [
  { href: "/overview", label: "Overview", meta: "Control", icon: Gauge, tone: "blue" },
  { href: "/projects", label: "Projects", meta: "Delivery", icon: LayoutGrid, tone: "blue" },
  { href: "/chat", label: "Catalyst Space", meta: "Messages", icon: MessagesSquare, tone: "violet" },
  { href: "/my-tasks", label: "My Tasks", meta: "Assigned", icon: ListChecks, tone: "violet" },
] satisfies NavigationItem[];
const OPERATION_ITEMS = [
  { href: "/timeproof", label: "Timeproof", meta: "Clocking", icon: Clock, tone: "amber" },
  { href: "/attendance", label: "Attendance", meta: "Team log", icon: CalendarCheck, tone: "green" },
  { href: "/leaves", label: "Leaves", meta: "Requests", icon: CalendarDays, tone: "green" },
] satisfies NavigationItem[];

const ACTIVE_TONE: Record<NavigationTone, string> = {
  blue: "border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  violet: "border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  amber: "border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  green: "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  coral: "border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300",
};

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const canManageUsers = user?.role.permissions.includes(PERMISSIONS.USERS_MANAGE) ?? false;
  const canManageRoles = user?.role.permissions.includes(PERMISSIONS.ROLES_MANAGE) ?? false;
  const administrationItems: NavigationItem[] = [
    ...(canManageUsers ? [{ href: "/users", label: "Users", meta: "Team", icon: Users, tone: "coral" as const }] : []),
    ...(canManageRoles ? [{ href: "/roles", label: "Roles", meta: "Access", icon: ShieldCheck, tone: "coral" as const }] : []),
    ...(user?.isSuperAdmin ? [{ href: "/platform", label: "Platform", meta: "Provisioning", icon: Crown, tone: "coral" as const }] : []),
  ];

  function renderItems(items: NavigationItem[]) {
    return items.map(({ href, label, meta, icon: Icon, tone }) => {
      const active = pathname === href || pathname?.startsWith(`${href}/`);
      return <Link key={href} href={href} title={collapsed ? label : undefined} className={cn("group relative flex h-11 items-center border-l-2 transition-[background-color,color,border-color] duration-150", collapsed ? "justify-center border-transparent px-2" : "gap-3 px-3", active ? ACTIVE_TONE[tone] : "border-transparent text-sidebar-foreground/62 hover:border-sidebar-border hover:bg-sidebar-accent/65 hover:text-sidebar-foreground")}>
        <Icon className="size-4 shrink-0 transition-transform duration-150 group-hover:scale-105" />
        {!collapsed && <><span className="min-w-0 flex-1 truncate text-[13px] font-medium">{label}</span><span className="text-[10px] text-sidebar-foreground/38">{meta}</span></>}
      </Link>;
    });
  }

  return <aside className={cn("relative hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-out lg:flex", collapsed ? "w-[4.75rem]" : "w-[16.5rem]")}>
    <div className={cn("flex h-16 items-center border-b border-sidebar-border px-3", collapsed ? "justify-center" : "justify-start")}><BrandLogo variant={collapsed ? "square" : "landscape"} className={collapsed ? "size-9" : "h-9 w-auto max-w-[11rem]"} priority /></div>
    <button type="button" onClick={() => setCollapsed((value) => !value)} className="group absolute -right-3 top-[5.35rem] z-10 flex size-6 items-center justify-center border border-sidebar-border bg-background text-muted-foreground shadow-sm transition-[transform,color,border-color] duration-200 hover:scale-110 hover:border-primary hover:text-primary" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand navigation" : "Collapse navigation"}>{collapsed ? <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-px" /> : <ChevronLeft className="size-3.5 transition-transform group-hover:-translate-x-px" />}</button>
    <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-5">
      {!collapsed && <p className="mb-2 px-3 text-[10px] font-semibold text-sidebar-foreground/38">Workspace</p>}
      <div className="grid gap-1">{renderItems(WORKSPACE_ITEMS)}</div>
      <div className="my-5 border-t border-sidebar-border" />
      {!collapsed && <p className="mb-2 px-3 text-[10px] font-semibold text-sidebar-foreground/38">Operations</p>}
      <div className="grid gap-1">{renderItems(OPERATION_ITEMS)}</div>
      {administrationItems.length > 0 && <><div className="my-5 border-t border-sidebar-border" />{!collapsed && <p className="mb-2 px-3 text-[10px] font-semibold text-sidebar-foreground/38">Administration</p>}<div className="grid gap-1">{renderItems(administrationItems)}</div></>}
    </nav>
    <div className="border-t border-sidebar-border p-2">
      <Link href="/profile" title="Profile" className={cn("flex h-11 items-center border-l-2 border-transparent text-sidebar-foreground/62 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground", collapsed ? "justify-center" : "gap-3 px-3")}><CircleUserRound className="size-4" />{!collapsed && <span className="text-[13px] font-medium">Profile</span>}</Link>
      <div className={cn("mt-1 flex h-10 items-center", collapsed ? "justify-center" : "justify-between px-3")}><Link href="/settings" title="Settings" className={cn("flex items-center text-sidebar-foreground/55 transition-colors hover:text-sidebar-foreground", !collapsed && "gap-3 text-[13px]")}><Settings className="size-4" />{!collapsed && "Settings"}</Link>{!collapsed && <ThemeToggle />}</div>
    </div>
  </aside>;
}
