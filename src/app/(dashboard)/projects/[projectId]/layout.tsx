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
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-border px-4 md:px-6">
        <div className="flex items-center gap-2 pt-4">
          <span
            className="flex size-7 items-center justify-center rounded-lg text-xs font-bold text-white"
            style={{ backgroundColor: project?.color ?? "#0891b2" }}
          >
            {project?.key.slice(0, 2) ?? ".."}
          </span>
          <h1 className="truncate text-base font-semibold">{project?.name ?? "Loading..."}</h1>
        </div>
        <nav className="mt-3 flex gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => {
            const href = `/projects/${projectId}/${tab.segment}`;
            const active = pathname === href;
            return (
              <Link
                key={tab.segment}
                href={href}
                className={cn(
                  "shrink-0 rounded-t-lg border-b-2 px-3 py-2 text-sm font-medium",
                  active ? "border-cyan-500 text-cyan-600" : "border-transparent text-muted-foreground hover:text-foreground"
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
