"use client";

import { Download, Share } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppButton({ compact = false }: { compact?: boolean }) {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const isStandalone = useSyncExternalStore(
    () => () => undefined,
    () => window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true),
    () => false
  );
  const isAppleMobile = useSyncExternalStore(
    () => () => undefined,
    () => /iPad|iPhone|iPod/.test(navigator.userAgent),
    () => false
  );

  useEffect(() => {
    function handleBeforeInstall(event: Event) {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  async function install() {
    if (prompt) {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      setPrompt(null);
      if (choice.outcome === "accepted") toast.success("Catalyst is ready from your home screen.");
      return;
    }

    if (isAppleMobile) {
      toast("To install Catalyst, use Share then Add to Home Screen.");
    }
  }

  if (isStandalone || (!prompt && !isAppleMobile)) return null;

  return (
    <Button
      aria-label="Install Ugnexa Catalyst"
      className="text-muted-foreground hover:text-foreground"
      size={compact ? "icon" : "sm"}
      variant="ghost"
      onClick={() => void install()}
    >
      {isAppleMobile && !prompt ? <Share className="size-4" /> : <Download className="size-4" />}
      {!compact && <span>Install app</span>}
    </Button>
  );
}
