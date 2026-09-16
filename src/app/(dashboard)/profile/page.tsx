"use client";

import { useRef, useState } from "react";
import { Camera, Check, KeyRound, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/AuthProvider";
import { useChangePassword, useUpdateProfile, useUploadAvatar } from "@/hooks/useProfile";
import { useOrganization } from "@/hooks/useOrganization";
import { PageHeader } from "@/components/layout/PageHeader";

function initials(name: string) { return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase(); }
function roleLabel(role: string | null) { return role?.split("_").map((part) => part[0] + part.slice(1).toLowerCase()).join(" ") ?? "Unassigned"; }

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: organization } = useOrganization();
  const [name, setName] = useState(user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const changePassword = useChangePassword();
  if (!user) return null;

  function saveIdentity(event: React.FormEvent) { event.preventDefault(); if (!name.trim() || name.trim() === user!.name) return; updateProfile.mutate({ name: name.trim() }, { onSuccess: () => toast.success("Profile updated"), onError: () => toast.error("Could not update your profile") }); }
  function selectAvatar(event: React.ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (!file) return; uploadAvatar.mutate(file, { onSuccess: () => toast.success("Profile image updated"), onError: () => toast.error("Could not upload this image") }); event.target.value = ""; }
  function updatePassword(event: React.FormEvent) { event.preventDefault(); if (newPassword.length < 8) return; changePassword.mutate({ currentPassword, newPassword }, { onSuccess: () => { toast.success("Password changed"); setCurrentPassword(""); setNewPassword(""); }, onError: (error: unknown) => toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Could not change your password") }); }

  return <div className="catalyst-page">
    <PageHeader title="Profile and access" section="Account / Personal workspace" tone="violet" actions={<span className="inline-flex w-fit items-center gap-2 border border-emerald-500/25 bg-emerald-500/8 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300"><Check className="size-3.5" /> Active account</span>} />
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,.65fr)]">
      <section className="catalyst-panel overflow-hidden"><div className="flex items-center justify-between border-b border-border px-5 py-3"><div className="flex items-center gap-2"><UserRound className="size-4 text-primary" /><h2 className="text-sm font-semibold">Identity</h2></div><span className="font-mono text-[9px] tracking-[.14em] text-muted-foreground uppercase">Editable</span></div><div className="grid gap-6 p-5 md:grid-cols-[10rem_1fr]">
        <div><div className="relative w-fit"><Avatar className="size-28 border border-border"><AvatarImage src={user.avatarUrl ?? undefined} /><AvatarFallback className="rounded-none bg-primary/12 text-2xl font-semibold text-primary">{initials(user.name)}</AvatarFallback></Avatar><button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadAvatar.isPending} className="absolute bottom-0 right-0 flex size-9 items-center justify-center border border-border bg-foreground text-background transition-transform hover:-translate-y-0.5" aria-label="Change profile image"><Camera className="size-4" /></button><input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={selectAvatar} /></div><p className="mt-3 text-[11px] leading-5 text-muted-foreground">JPG, PNG or WebP. Use a square image for the best result.</p></div>
        <form onSubmit={saveIdentity} className="grid content-start gap-4"><div className="grid gap-1.5"><Label htmlFor="profileName">Display name</Label><Input id="profileName" value={name} onChange={(event) => setName(event.target.value)} /></div><div className="grid gap-1.5"><Label htmlFor="profileEmail">Account email</Label><Input id="profileEmail" value={user.email} disabled /><p className="text-[11px] text-muted-foreground">Email changes require Super Admin approval.</p></div><Button type="submit" className="w-fit bg-primary text-primary-foreground" disabled={updateProfile.isPending || !name.trim() || name.trim() === user.name}>{updateProfile.isPending ? "Saving..." : "Save identity"}</Button></form>
      </div></section>
      <aside className="catalyst-panel"><div className="flex items-center gap-2 border-b border-border px-5 py-3"><ShieldCheck className="size-4 text-primary" /><h2 className="text-sm font-semibold">Access scope</h2></div><dl className="divide-y divide-border"><AccessFact label="System role" value={roleLabel(user.role.name)} /><AccessFact label="Organization" value={organization?.name ?? "Loading..."} /><AccessFact label="Workspace type" value={user.role.name === "DEVELOPER" ? "Umbrella developer" : user.role.name === "CLIENT_ADMIN" ? "Client organization" : "Platform control"} /><AccessFact label="Account ID" value={user.id.slice(-8).toUpperCase()} mono /></dl></aside>
    </div>
    <section className="catalyst-panel"><div className="flex items-center justify-between border-b border-border px-5 py-3"><div className="flex items-center gap-2"><KeyRound className="size-4 text-primary" /><h2 className="text-sm font-semibold">Security</h2></div><span className="text-[11px] text-muted-foreground">Changing your password revokes other refresh sessions.</span></div><form onSubmit={updatePassword} className="grid gap-4 p-5 md:grid-cols-[1fr_1fr_auto] md:items-end"><div className="grid gap-1.5"><Label htmlFor="currentPassword">Current password</Label><Input id="currentPassword" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></div><div className="grid gap-1.5"><Label htmlFor="newPassword">New password</Label><Input id="newPassword" type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></div><Button type="submit" variant="outline" disabled={changePassword.isPending || !currentPassword || newPassword.length < 8}>{changePassword.isPending ? "Updating..." : "Update password"}</Button></form></section>
  </div>;
}

function AccessFact({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) { return <div className="px-5 py-4"><dt className="font-mono text-[9px] tracking-[.14em] text-muted-foreground uppercase">{label}</dt><dd className={`mt-1.5 text-sm font-medium ${mono ? "font-mono tracking-[.08em]" : ""}`}>{value}</dd></div>; }
