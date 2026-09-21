"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { PasswordChangeBanner } from "@/components/layout/PasswordChangeBanner";
import { InstallAppDialog } from "@/components/pwa/InstallAppDialog";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  useNotificationSocket();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="grid min-h-dvh grid-cols-[4.5rem_1fr] bg-background">
        <div className="hidden border-r border-border bg-sidebar lg:block" />
        <div className="p-5 lg:p-8">
          <div className="h-8 w-44 animate-pulse bg-muted" />
          <div className="mt-8 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3"><div className="h-28 animate-pulse bg-card" /><div className="h-28 animate-pulse bg-card" /><div className="h-28 animate-pulse bg-card" /></div>
          <div className="mt-6 h-72 animate-pulse border border-border bg-card" />
        </div>
      </div>
    );
  }

  return (
    <div className="catalyst-shell flex h-dvh min-w-0 overflow-x-hidden bg-background">
      <Sidebar />
      <div className="flex min-w-0 max-w-full flex-1 flex-col overflow-x-hidden">
        <Topbar />
        {user.mustChangePassword && <PasswordChangeBanner />}
        <main className="dashboard-stage min-w-0 max-w-full flex-1 overflow-x-hidden overflow-y-auto pb-20 lg:pb-0">{children}</main>
      </div>
      <MobileNav />
      <InstallAppDialog />
    </div>
  );
}
