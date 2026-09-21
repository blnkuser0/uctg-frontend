"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  CalendarCheck,
  CalendarDays,
  CircleUserRound,
  Clock,
  Crown,
  Gauge,
  LayoutGrid,
  ListChecks,
  LogOut,
  MessagesSquare,
  MoreHorizontal,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { PERMISSIONS } from "@/types/role";

type NavItem = { href: string; label: string; icon: typeof Gauge };

// The everyday destinations get a tab; everything else in the desktop sidebar
// lives behind "More" so nothing is unreachable on a phone / installed app.
const TAB_ITEMS: NavItem[] = [
  { href: "/overview", label: "Overview", icon: Gauge },
  { href: "/projects", label: "Projects", icon: LayoutGrid },
  { href: "/chat", label: "Space", icon: MessagesSquare },
  { href: "/timeproof", label: "Clock", icon: Clock },
  { href: "/my-tasks", label: "Tasks", icon: ListChecks },
];

const isActive = (pathname: string | null, href: string) => pathname === href || !!pathname?.startsWith(`${href}/`);

const tabClass = (active: boolean) =>
  cn(
    "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold tracking-wide",
    active ? "text-primary" : "text-muted-foreground transition-colors hover:text-foreground"
  );

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const permissions = user?.role.permissions ?? [];
  const operations: NavItem[] = [
    { href: "/attendance", label: "Attendance", icon: CalendarCheck },
    { href: "/leaves", label: "Leaves", icon: CalendarDays },
  ];
  const administration: NavItem[] = [
    ...(permissions.includes(PERMISSIONS.USERS_MANAGE) ? [{ href: "/users", label: "Users", icon: Users }] : []),
    ...(permissions.includes(PERMISSIONS.ROLES_MANAGE) ? [{ href: "/roles", label: "Roles", icon: ShieldCheck }] : []),
    ...(user?.isSuperAdmin ? [{ href: "/platform", label: "Platform", icon: Crown }] : []),
  ];
  const account: NavItem[] = [
    { href: "/profile", label: "Profile", icon: CircleUserRound },
    { href: "/settings", label: "Settings", icon: Settings },
  ];
  const moreActive = [...operations, ...administration, ...account].some((item) => isActive(pathname, item.href));

  async function handleLogout() {
    setMoreOpen(false);
    await logout();
    router.push("/login");
  }

  function renderGroup(title: string, items: NavItem[]) {
    if (items.length === 0) return null;
    return (
      <div>
        <p className="mb-2 px-1 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">{title}</p>
        <div className="grid grid-cols-3 gap-2">
          {items.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMoreOpen(false)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition-colors",
                  active ? "border-primary/50 bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:bg-muted/60"
                )}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border/80 bg-card/95 px-1 backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {TAB_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link key={href} href={href} className={tabClass(active)}>
              {active && <span className="absolute top-0 h-0.5 w-7 bg-primary" />}
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
        <button type="button" onClick={() => setMoreOpen(true)} aria-haspopup="dialog" className={tabClass(moreActive)}>
          {moreActive && <span className="absolute top-0 h-0.5 w-7 bg-primary" />}
          <MoreHorizontal className="size-5" />
          More
        </button>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="max-h-[85dvh] gap-5 overflow-y-auto rounded-t-2xl px-4 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <SheetHeader className="p-0">
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription className="sr-only">All pages in Ugnexa Catalyst</SheetDescription>
          </SheetHeader>
          {renderGroup("Operations", operations)}
          {renderGroup("Administration", administration)}
          {renderGroup("Account", account)}
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex items-center justify-center gap-2 rounded-lg border border-border py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="size-4" />
            Log out
          </button>
        </SheetContent>
      </Sheet>
    </>
  );
}
