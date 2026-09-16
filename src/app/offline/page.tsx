"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <main className="catalyst-grid flex min-h-dvh flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <div className="flex size-14 items-center justify-center border border-primary/30 bg-primary/10 text-primary">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
        </svg>
      </div>
      <h1 className="text-lg font-semibold text-foreground">You&apos;re offline</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        Ugnexa Catalyst can&apos;t reach the network right now. Check your connection and try again.
      </p>
      <Button className="mt-3 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => window.location.reload()}><RefreshCw className="size-4" /> Retry connection</Button>
    </main>
  );
}
