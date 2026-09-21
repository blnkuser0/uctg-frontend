"use client";

import { Download, PlusSquare, Share, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { Button } from "@/components/ui/button";
import { clearInstallPrompt, getInstallPrompt, subscribeInstallPrompt } from "./installPromptStore";

const DISMISSED_KEY = "ugnexa-install-dismissed-at";
const DISMISS_FOR_MS = 7 * 24 * 60 * 60 * 1000;
const SHOW_AFTER_MS = 2500;

const noopSubscribe = () => () => undefined;

function recentlyDismissed(): boolean {
  try {
    const at = Number(localStorage.getItem(DISMISSED_KEY));
    return Number.isFinite(at) && at > 0 && Date.now() - at < DISMISS_FOR_MS;
  } catch {
    return false;
  }
}

function rememberDismissal() {
  try {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  } catch {
    // Private mode etc. — the prompt just may reappear next visit.
  }
}

function isInstalledDisplay(): boolean {
  return (
    ["standalone", "fullscreen", "minimal-ui", "window-controls-overlay"].some(
      (mode) => window.matchMedia(`(display-mode: ${mode})`).matches
    ) || (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosDevice(): boolean {
  // iPadOS reports itself as a Mac, but a Mac has no touch screen.
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

// Asks people using the site in a browser to install it. Never shown once the app is
// installed (opened as a standalone window/app), and there is deliberately no
// always-visible install button anywhere else.
//   • Phones (<640px): a centered modal over a dimmed page.
//   • Desktop / Mac / tablets: a card at the bottom that leaves the page usable.
//   • iPhone/iPad: Safari has no install API, so it explains Share → Add to Home Screen.
export function InstallAppDialog() {
  const prompt = useSyncExternalStore(subscribeInstallPrompt, getInstallPrompt, () => null);
  const installed = useSyncExternalStore(noopSubscribe, isInstalledDisplay, () => true);
  const ios = useSyncExternalStore(noopSubscribe, isIosDevice, () => false);
  const [shown, setShown] = useState(false);

  const eligible = !installed && (prompt !== null || ios);

  useEffect(() => {
    if (!eligible) return;
    const timer = setTimeout(() => {
      if (!recentlyDismissed()) setShown(true);
    }, SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, [eligible]);

  useEffect(() => {
    if (!shown) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") dismiss();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shown]);

  function dismiss() {
    rememberDismissal();
    setShown(false);
  }

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    // The browser allows only one prompt() per captured event.
    clearInstallPrompt();
    setShown(false);
    if (choice.outcome === "accepted") toast.success("Catalyst was added to your device.");
    else rememberDismissal();
  }

  if (!eligible || !shown) return null;

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 sm:pointer-events-none sm:items-end sm:bg-transparent sm:pb-24 lg:pb-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <div
        role="dialog"
        aria-labelledby="install-prompt-title"
        className="pointer-events-auto relative w-full max-w-sm animate-in fade-in-0 zoom-in-95 rounded-xl border border-border bg-card p-5 text-card-foreground shadow-2xl duration-300 sm:max-w-xl sm:slide-in-from-bottom-6 sm:zoom-in-100"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:gap-4 sm:pr-6 sm:text-left">
          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 ring-1 ring-black/5">
            <BrandLogo variant="square" className="h-full w-full" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 id="install-prompt-title" className="text-base font-semibold">
              Install Ugnexa Catalyst
            </h2>
            {prompt ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Open it like any other app — faster to reach, full screen, no browser tabs.
              </p>
            ) : (
              <ol className="mt-2 grid gap-1.5 text-left text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-foreground">1</span>
                  <span>
                    Tap the <Share className="inline size-4 -translate-y-px text-primary" aria-label="Share" /> Share button in Safari
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-foreground">2</span>
                  <span>
                    Choose <PlusSquare className="inline size-4 -translate-y-px text-primary" aria-hidden /> <span className="font-medium text-foreground">Add to Home Screen</span>
                  </span>
                </li>
              </ol>
            )}
          </div>

          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
            {prompt && (
              <Button autoFocus onClick={() => void install()} className="bg-cyan-600 text-white hover:bg-cyan-500">
                <Download className="size-4" />
                Install
              </Button>
            )}
            <Button variant="ghost" onClick={dismiss}>
              {prompt ? "Not now" : "Got it"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
