"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppOrigin } from "@/lib/appUrl";

export interface AccountCredentials {
  email: string;
  password: string;
}

async function copyText(text: string, what: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${what} copied`);
    return true;
  } catch {
    toast.error("Couldn't copy — select the text and copy it manually.");
    return false;
  }
}

function CopyRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="grid gap-1">
      <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{label}</span>
      <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 py-1 pr-1 pl-3">
        <span className={`min-w-0 flex-1 truncate text-sm ${mono ? "font-mono" : ""}`}>{value}</span>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={`Copy ${label.toLowerCase()}`}
          onClick={async () => {
            if (await copyText(value, label)) {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }
          }}
        >
          {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
        </Button>
      </div>
    </div>
  );
}

// Shown when the login-details email could not be sent (no email provider yet, or it
// failed): the admin gets the credentials here and passes them on themselves.
export function CredentialsDialog({
  credentials,
  onClose,
  title = "Account created",
}: {
  credentials: AccountCredentials | null;
  onClose: () => void;
  title?: string;
}) {
  const origin = useAppOrigin();
  const loginUrl = `${origin}/login`;

  const message = credentials
    ? [
        "Hi! Your Ugnexa Catalyst account is ready.",
        "",
        `Sign in: ${loginUrl}`,
        `Email: ${credentials.email}`,
        `Temporary password: ${credentials.password}`,
        "",
        "Please change your password after you sign in (Profile → Security).",
      ].join("\n")
    : "";

  return (
    <Dialog open={credentials !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            The login email couldn&apos;t be sent, so give them these details yourself (chat, text, or in person). They should
            change the password after signing in.
          </DialogDescription>
        </DialogHeader>

        {credentials && (
          <div className="grid gap-3">
            <CopyRow label="Sign-in page" value={loginUrl} />
            <CopyRow label="Email" value={credentials.email} />
            <CopyRow label="Temporary password" value={credentials.password} mono />
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => void copyText(message, "Message")}>
            <Copy className="size-4" />
            Copy as message
          </Button>
          <Button type="button" onClick={onClose} className="bg-cyan-600 text-white hover:bg-cyan-500">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
