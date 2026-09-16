"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gauge, LayoutGrid, ListChecks, Clock, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/overview", label: "Overview", icon: Gauge },
  { href: "/projects", label: "Projects", icon: LayoutGrid },
  { href: "/timeproof", label: "Clock", icon: Clock },
  { href: "/leaves", label: "Leaves", icon: CalendarDays },
  { href: "/my-tasks", label: "Tasks", icon: ListChecks },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border/80 bg-card/95 px-1 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname?.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold tracking-wide",
              active ? "text-primary" : "text-muted-foreground transition-colors hover:text-foreground"
            )}
          >
            {active && <span className="absolute top-0 h-0.5 w-7 bg-primary" />}
            <Icon className="size-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
