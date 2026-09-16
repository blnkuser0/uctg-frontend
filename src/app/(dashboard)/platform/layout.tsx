"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/platform/organizations", label: "Organizations" },
  { href: "/platform/developers", label: "Developers" },
  { href: "/platform/projects", label: "Projects" },
];

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user?.isSuperAdmin) {
      router.replace("/projects");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user?.isSuperAdmin) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-border/80 bg-background/55 px-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="pt-5">
          <p className="catalyst-eyebrow">Platform</p>
          <h1 className="text-lg font-bold tracking-tight">Super Admin</h1>
        </div>
        <nav className="mt-4 flex gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => {
            const active = pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "shrink-0 rounded-t-lg border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
