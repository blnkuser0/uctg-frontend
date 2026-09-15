"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarCheck, CalendarDays, Clock, LayoutGrid, ListChecks, MessagesSquare, Settings, ShieldCheck, Sparkles, Users } from "lucide-react";
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
          className={cn(
            "group flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-all",
            active
              ? "bg-primary text-primary-foreground shadow-[0_8px_18px_-12px_var(--primary)]"
              : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <Icon className={cn("size-4", active ? "" : "text-primary/75 group-hover:text-primary")} />
          <span>{label}</span>
        </Link>
      );
    });
  }

  const workspaceItems = items.filter((item) => !OPERATION_PATHS.has(item.href) && !ADMIN_PATHS.has(item.href));
  const operationItems = items.filter((item) => OPERATION_PATHS.has(item.href));
  const administrationItems = items.filter((item) => ADMIN_PATHS.has(item.href));

  return (
    <aside className="hidden w-[17.25rem] shrink-0 flex-col border-r border-sidebar-border bg-sidebar/95 px-3 py-4 backdrop-blur-xl lg:flex">
      <div className="flex h-14 items-center justify-center rounded-sm bg-white p-2 shadow-sm">
        <BrandLogo variant="landscape" className="h-full w-full" priority />
      </div>
      <nav className="mt-6 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1">
        <p className="px-3 pb-1 text-[10px] font-semibold tracking-[0.14em] text-sidebar-foreground/40 uppercase">Workspace</p>
        {renderItems(workspaceItems)}
        <p className="mt-5 px-3 pb-1 text-[10px] font-semibold tracking-[0.14em] text-sidebar-foreground/40 uppercase">Operations</p>
        {renderItems(operationItems)}
        {administrationItems.length > 0 && <><p className="mt-5 px-3 pb-1 text-[10px] font-semibold tracking-[0.14em] text-sidebar-foreground/40 uppercase">Administration</p>{renderItems(administrationItems)}</>}
      </nav>
      <div className="mt-4 rounded-sm border border-sidebar-border bg-sidebar-accent/55 p-3.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-sidebar-accent-foreground"><Sparkles className="size-3.5 text-primary" />Catalyst is ready</div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-sidebar-foreground/60">Your workspace stays available from the home screen.</p>
        <div className="mt-2.5 flex items-center gap-1"><InstallAppButton /><ThemeToggle /><Link href="/settings" aria-label="Workspace settings" className="inline-flex size-8 items-center justify-center rounded-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar hover:text-sidebar-foreground"><Settings className="size-4" /></Link></div>
      </div>
    </aside>
  );
}
