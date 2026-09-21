"use client";

import { Download, Share } from "lucide-react";
import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { clearInstallPrompt, getInstallPrompt, subscribeInstallPrompt } from "./installPrompt";

const noopSubscribe = () => () => undefined;

export function InstallAppButton({ compact = false, className }: { compact?: boolean; className?: string }) {
  const prompt = useSyncExternalStore(subscribeInstallPrompt, getInstallPrompt, () => null);
  const isStandalone = useSyncExternalStore(
    noopSubscribe,
    () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true,
    () => false
  );
  const isAppleMobile = useSyncExternalStore(
    noopSubscribe,
    () => /iPad|iPhone|iPod/.test(navigator.userAgent),
    () => false
  );

  async function install() {
    if (prompt) {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      // The browser only allows one prompt() per captured event.
      clearInstallPrompt();
      if (choice.outcome === "accepted") toast.success("Catalyst was added to your device.");
      return;
    }

    if (isAppleMobile) {
      toast("To install Catalyst, tap Share, then Add to Home Screen.");
    }
  }

  // Already installed, or the browser has nothing installable to offer.
  if (isStandalone || (!prompt && !isAppleMobile)) return null;

  return (
    <Button
      aria-label="Install Ugnexa Catalyst"
      title="Install app"
      className={cn("text-muted-foreground hover:text-foreground", className)}
      size={compact ? "icon" : "sm"}
      variant="ghost"
      onClick={() => void install()}
    >
      {isAppleMobile && !prompt ? <Share className="size-4" /> : <Download className="size-4" />}
      {!compact && <span>Install app</span>}
    </Button>
  );
}
