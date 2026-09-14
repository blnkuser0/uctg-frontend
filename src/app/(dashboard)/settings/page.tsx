"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/AuthProvider";
import { useUpdateProfile, useUploadAvatar, useChangePassword } from "@/hooks/useProfile";
import { useOrganization, useUpdateOrganization } from "@/hooks/useOrganization";
import { PERMISSIONS } from "@/types/role";
import { Camera } from "lucide-react";

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function SettingsPage() {
  const { user } = useAuth();
  const canManageOrg = user?.role.permissions.includes(PERMISSIONS.ORG_MANAGE) ?? false;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-lg font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and password.</p>
      </div>

      <ProfileSection />
      <PasswordSection />
      {canManageOrg && <OrganizationSection />}
    </div>
  );
}

function ProfileSection() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  if (!user) return null;

  function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || name.trim() === user!.name) return;
    updateProfile.mutate(
      { name: name.trim() },
      {
        onSuccess: () => toast.success("Profile updated"),
        onError: () => toast.error("Could not update your profile."),
      }
    );
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadAvatar.mutate(file, {
      onSuccess: () => toast.success("Avatar updated"),
      onError: () => toast.error("Could not upload your avatar."),
    });
    e.target.value = "";
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">Profile</h2>

      <div className="mt-3 flex items-center gap-4">
        <div className="relative">
          <Avatar className="size-16">
            <AvatarImage src={user.avatarUrl ?? undefined} />
            <AvatarFallback className="bg-amber-500/20 text-lg text-amber-700">{initials(user.name)}</AvatarFallback>
          </Avatar>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploadAvatar.isPending}
            aria-label="Change avatar"
            className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-amber-500 text-stone-900 shadow-sm hover:bg-amber-400"
          >
            <Camera className="size-3.5" />
          </button>
        </div>
        <div className="text-sm text-muted-foreground">{user.email}</div>
      </div>

      <form onSubmit={handleSaveName} className="mt-4 flex items-end gap-2">
        <div className="grid flex-1 gap-1.5">
          <Label htmlFor="profileName">Name</Label>
          <Input id="profileName" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <Button
          type="submit"
          variant="outline"
          disabled={updateProfile.isPending || !name.trim() || name.trim() === user.name}
        >
          {updateProfile.isPending ? "Saving..." : "Save"}
        </Button>
      </form>
    </section>
  );
}

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const changePassword = useChangePassword();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          toast.success("Password changed");
          setCurrentPassword("");
          setNewPassword("");
        },
        onError: (err: unknown) => {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Could not change your password.";
          toast.error(message);
        },
      }
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">Password</h2>
      <form onSubmit={handleSubmit} className="mt-3 grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="currentPassword">Current password</Label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="newPassword">New password</Label>
          <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <Button
          type="submit"
          variant="outline"
          className="justify-self-start"
          disabled={changePassword.isPending || !currentPassword || newPassword.length < 8}
        >
          {changePassword.isPending ? "Changing..." : "Change password"}
        </Button>
      </form>
    </section>
  );
}

function OrganizationSection() {
  const { data: org } = useOrganization();
  const [name, setName] = useState("");
  const updateOrganization = useUpdateOrganization();

  if (!org) return null;
  const currentName = name || org.name;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentName.trim() || currentName.trim() === org!.name) return;
    updateOrganization.mutate(
      { name: currentName.trim() },
      {
        onSuccess: () => toast.success("Organization updated"),
        onError: () => toast.error("Could not update the organization."),
      }
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">Organization</h2>
      <form onSubmit={handleSubmit} className="mt-3 flex items-end gap-2">
        <div className="grid flex-1 gap-1.5">
          <Label htmlFor="orgName">Organization name</Label>
          <Input id="orgName" value={currentName} onChange={(e) => setName(e.target.value)} />
        </div>
        <Button
          type="submit"
          variant="outline"
          disabled={updateOrganization.isPending || !currentName.trim() || currentName.trim() === org.name}
        >
          {updateOrganization.isPending ? "Saving..." : "Save"}
        </Button>
      </form>
    </section>
  );
}
