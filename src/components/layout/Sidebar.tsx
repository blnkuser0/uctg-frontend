"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarCheck, CalendarDays, Clock, LayoutGrid, ListChecks, MessagesSquare, PanelLeftClose, PanelLeftOpen, Settings, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { InstallAppButton } from "@/components/pwa/InstallAppButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { PERMISSIONS } from "@/types/role";

const NAV_ITEMS = [
  { href: "/projects", label: "Projects", icon: LayoutGrid },
  { href: "/chat", label: "Catalyst Space", icon: MessagesSquare },
  { href: "/my-tasks", label: "My Tasks", icon: ListChecks },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/timeproof", label: "Timeproof", icon: Clock },
  { href: "/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/leaves", label: "Leaves", icon: CalendarDays },
];

const OPERATION_PATHS = new Set(["/timeproof", "/attendance", "/leaves"]);
const ADMIN_PATHS = new Set(["/users", "/roles"]);

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const canManageUsers = user?.role.permissions.includes(PERMISSIONS.USERS_MANAGE);
  const canManageRoles = user?.role.permissions.includes(PERMISSIONS.ROLES_MANAGE);
  const items = [
    ...NAV_ITEMS,
    ...(canManageUsers ? [{ href: "/users", label: "Users", icon: Users }] : []),
    ...(canManageRoles ? [{ href: "/roles", label: "Roles", icon: ShieldCheck }] : []),
  ];

  function renderItems(collection: typeof items) {
    return collection.map(({ href, label, icon: Icon }) => {
      const active = pathname === href || pathname?.startsWith(`${href}/`);
      return (
        <Link
          key={href}
          href={href}
          title={collapsed ? label : undefined}
          className={cn(
            "group flex items-center rounded-sm py-2.5 text-sm font-medium transition-colors",
            collapsed ? "justify-center px-2" : "gap-3 px-3",
            active
              ? "bg-primary text-primary-foreground shadow-[0_8px_18px_-12px_var(--primary)]"
              : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <Icon className={cn("size-4 shrink-0", active ? "" : "text-primary/75 group-hover:text-primary")} />
          {!collapsed && <span>{label}</span>}
        </Link>
      );
    });
  }

  const workspaceItems = items.filter((item) => !OPERATION_PATHS.has(item.href) && !ADMIN_PATHS.has(item.href));
  const operationItems = items.filter((item) => OPERATION_PATHS.has(item.href));
  const administrationItems = items.filter((item) => ADMIN_PATHS.has(item.href));

  return (
    <aside className={cn("hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-3 py-4 transition-[width,padding] duration-200 lg:flex", collapsed ? "w-20 px-2" : "w-[17.25rem] px-3")}>
      <div className={cn("flex items-center rounded-sm border border-sidebar-border bg-white p-2 shadow-sm dark:bg-sidebar-accent/35", collapsed ? "h-14 justify-center" : "h-14 justify-between")}>
        <BrandLogo variant={collapsed ? "square" : "landscape"} className={collapsed ? "size-10" : "h-full min-w-0 flex-1"} priority />
        {!collapsed && <button type="button" onClick={() => setCollapsed(true)} className="ml-2 inline-flex size-8 shrink-0 items-center justify-center rounded-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" aria-label="Collapse sidebar" title="Collapse sidebar"><PanelLeftClose className="size-4" /></button>}
      </div>
      {collapsed && <button type="button" onClick={() => setCollapsed(false)} className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" aria-label="Expand sidebar" title="Expand sidebar"><PanelLeftOpen className="size-4" /></button>}
      <nav className="mt-6 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1">
        {collapsed ? <div className="mx-2 mb-1 h-px bg-sidebar-border" /> : <p className="px-3 pb-1 text-[10px] font-semibold tracking-[0.14em] text-sidebar-foreground/40 uppercase">Workspace</p>}
        {renderItems(workspaceItems)}
        {collapsed ? <div className="mx-2 my-4 h-px bg-sidebar-border" /> : <p className="mt-5 px-3 pb-1 text-[10px] font-semibold tracking-[0.14em] text-sidebar-foreground/40 uppercase">Operations</p>}
        {renderItems(operationItems)}
        {administrationItems.length > 0 && <>{collapsed ? <div className="mx-2 my-4 h-px bg-sidebar-border" /> : <p className="mt-5 px-3 pb-1 text-[10px] font-semibold tracking-[0.14em] text-sidebar-foreground/40 uppercase">Administration</p>}{renderItems(administrationItems)}</>}
      </nav>
      <div className={cn("mt-4 rounded-sm border border-sidebar-border bg-sidebar-accent/55", collapsed ? "p-1.5" : "p-3.5")}>
        {!collapsed && <><div className="flex items-center gap-2 text-xs font-semibold text-sidebar-accent-foreground"><Sparkles className="size-3.5 text-primary" />Catalyst is ready</div><p className="mt-1.5 text-[11px] leading-relaxed text-sidebar-foreground/60">Your workspace stays available from the home screen.</p></>}
        <div className={cn("flex items-center gap-1", !collapsed && "mt-2.5", collapsed && "flex-col")}><InstallAppButton /><ThemeToggle /><Link href="/settings" aria-label="Workspace settings" title="Workspace settings" className="inline-flex size-8 items-center justify-center rounded-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar hover:text-sidebar-foreground"><Settings className="size-4" /></Link></div>
      </div>
    </aside>
  );
}
