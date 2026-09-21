"use client";

import { IdCard as IdCardIcon } from "lucide-react";
import { useMyIdCard } from "@/hooks/useIdCard";
import { IdCard } from "./IdCard";

export function IdCardPanel() {
  const { data, isLoading, isError } = useMyIdCard();

  return (
    <section className="catalyst-panel">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <IdCardIcon className="size-4 text-primary" />
        <h2 className="text-sm font-semibold">Company ID</h2>
      </div>
      <div className="grid gap-6 p-5 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
        <div className="flex justify-center">
          {isLoading && <div className="aspect-[54/86] w-[16.5rem] animate-pulse rounded-xl bg-muted" />}
          {isError && <p className="text-sm text-destructive">Could not load your ID card.</p>}
          {data && <IdCard card={data} />}
        </div>
        <div className="grid gap-2 text-sm text-muted-foreground">
          <p>This is your official Ugnexa Catalyst ID. Anyone who scans the QR code sees your name, role, and whether your account is still active — nothing else.</p>
          <p>Your photo comes from your profile image above, so upload one before printing. Use <span className="font-medium text-foreground">Print / Save as PDF</span> and choose a 54 × 86 mm (CR80) card size, or &quot;Save as PDF&quot; to send it to a print shop.</p>
        </div>
      </div>
    </section>
  );
}
