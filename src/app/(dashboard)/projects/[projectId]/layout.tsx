"use client";

import { use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProject } from "@/hooks/useProject";
import { cn } from "@/lib/utils";

const TABS = [
  { segment: "board", label: "Board" },
  { segment: "list", label: "List" },
  { segment: "reports", label: "Reports" },
  { segment: "settings", label: "Settings" },
];

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const { data: project } = useProject(projectId);
  const pathname = usePathname();

  return (
    <div className="flex h-full min-w-0 flex-col">
      <div className="shrink-0 border-b border-border/80 bg-card px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 pt-5">
          <span
            className="flex size-9 items-center justify-center border border-black/10 text-xs font-bold text-slate-950 shadow-sm dark:border-white/10"
            style={{ backgroundColor: project?.color ?? "#0891b2" }}
          >
            {project?.key.slice(0, 2) ?? ".."}
          </span>
          <div className="min-w-0"><p className="text-[11px] font-medium text-muted-foreground">Project workspace</p><h1 className="truncate text-lg font-semibold tracking-[-.02em]">{project?.name ?? "Loading..."}</h1></div>
        </div>
        <nav className="mt-4 flex gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => {
            const href = `/projects/${projectId}/${tab.segment}`;
            const active = pathname === href;
            return (
              <Link
                key={tab.segment}
                href={href}
                className={cn(
                  "shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
