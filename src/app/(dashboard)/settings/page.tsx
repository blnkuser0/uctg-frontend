"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, CircleUserRound, MonitorCog } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuth } from "@/providers/AuthProvider";
import { useOrganization, useUpdateOrganization } from "@/hooks/useOrganization";
import { PERMISSIONS } from "@/types/role";
import { PageHeader } from "@/components/layout/PageHeader";

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: organization } = useOrganization();
  const [name, setName] = useState("");
  const updateOrganization = useUpdateOrganization();
  const canManage = user?.role.permissions.includes(PERMISSIONS.ORG_MANAGE) ?? false;
  const currentName = name || organization?.name || "";
  function saveOrganization(event: React.FormEvent) { event.preventDefault(); if (!organization || !currentName.trim() || currentName.trim() === organization.name) return; updateOrganization.mutate({ name: currentName.trim() }, { onSuccess: () => toast.success("Organization updated"), onError: () => toast.error("Could not update the organization") }); }

  return <div className="catalyst-page">
    <PageHeader title="Settings" section="System / Workspace controls" tone="amber" />
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="catalyst-panel"><div className="flex items-center gap-2 border-b border-border px-5 py-3"><Building2 className="size-4 text-primary" /><h2 className="text-sm font-semibold">Organization</h2></div><form onSubmit={saveOrganization} className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-end"><div className="grid gap-1.5"><Label htmlFor="organizationName">Workspace name</Label><Input id="organizationName" value={currentName} disabled={!canManage} onChange={(event) => setName(event.target.value)} /></div>{canManage ? <Button type="submit" variant="outline" disabled={updateOrganization.isPending || !organization || currentName.trim() === organization.name}>{updateOrganization.isPending ? "Saving..." : "Save"}</Button> : <span className="pb-2 text-xs text-muted-foreground">Managed by an administrator</span>}</form></section>
      <section className="catalyst-panel"><div className="flex items-center gap-2 border-b border-border px-5 py-3"><MonitorCog className="size-4 text-primary" /><h2 className="text-sm font-semibold">Interface</h2></div><div className="flex items-center justify-between p-5"><div><p className="text-sm font-medium">Color theme</p><p className="mt-1 text-xs text-muted-foreground">Follows your saved preference or system setting.</p></div><ThemeToggle /></div></section>
    </div>
    <Link href="/profile" className="group flex items-center justify-between border border-border bg-card px-5 py-4 transition-colors hover:border-primary/50"><div className="flex items-center gap-3"><CircleUserRound className="size-4 text-primary" /><div><p className="text-sm font-medium">Profile and security</p><p className="mt-0.5 text-xs text-muted-foreground">Update your identity, avatar, and password.</p></div></div><span className="font-mono text-[10px] tracking-[.12em] text-primary uppercase transition-transform group-hover:translate-x-0.5">Open profile →</span></Link>
  </div>;
}
