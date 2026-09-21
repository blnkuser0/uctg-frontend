"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useResetUserPassword } from "@/hooks/useUsers";
import { announceAccountCreated } from "@/lib/accountCreated";
import { User } from "@/types/user";
import type { AccountCredentials } from "./CredentialsDialog";

interface ResetPasswordDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Called with the login details when the email couldn't be sent, so the admin can pass them on.
  onCredentials: (credentials: AccountCredentials | null) => void;
}

export function ResetPasswordDialog({ user, open, onOpenChange, onCredentials }: ResetPasswordDialogProps) {
  const resetPassword = useResetUserPassword();

  function handleReset() {
    resetPassword.mutate(user.id, {
      onSuccess: (updated) => {
        onCredentials(announceAccountCreated(updated, "Password", "reset"));
        onOpenChange(false);
      },
      onError: (err: unknown) => {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Could not reset this password.";
        toast.error(message);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !resetPassword.isPending && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset {user.name}&apos;s password to the default?</DialogTitle>
          <DialogDescription>
            Use this when someone forgot their password. It goes back to the default password (the same one every new account starts
            with) and they&apos;re signed out on every device. They can sign in with it and then choose a new password. We&apos;ll email
            them the details, and show them to you here if the email can&apos;t be sent.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={resetPassword.isPending}>
            Cancel
          </Button>
          <Button onClick={handleReset} disabled={resetPassword.isPending} className="bg-cyan-600 text-white hover:bg-cyan-500">
            {resetPassword.isPending ? "Resetting..." : "Reset to default"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
