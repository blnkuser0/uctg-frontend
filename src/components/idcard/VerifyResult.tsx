"use client";

import { BadgeCheck, ShieldAlert, ShieldX } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { verifyId } from "@/services/idCard.service";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function VerifyResult({ token }: { token: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["verify-id", token],
    queryFn: () => verifyId(token),
    retry: false,
  });

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="mb-6 flex size-14 items-center justify-center overflow-hidden rounded-md bg-white p-1.5 shadow-sm ring-1 ring-black/5">
        <BrandLogo variant="square" className="h-full w-full" priority />
      </div>

      <div className="catalyst-panel w-full max-w-sm overflow-hidden">
        {isLoading && <p className="p-10 text-center text-sm text-muted-foreground">Verifying ID…</p>}

        {isError && (
          <div className="grid justify-items-center gap-3 p-8 text-center">
            <ShieldX className="size-10 text-destructive" />
            <h1 className="text-lg font-bold">ID not recognized</h1>
            <p className="text-sm text-muted-foreground">This QR code doesn&apos;t match any Ugnexa Catalyst account. Treat this ID as invalid.</p>
          </div>
        )}

        {data && (
          <>
            <div
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold",
                data.isActive
                  ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
                  : "bg-destructive/12 text-destructive"
              )}
            >
              {data.isActive ? <BadgeCheck className="size-4" /> : <ShieldAlert className="size-4" />}
              {data.isActive ? "Valid — active employee" : "Not active — do not honor this ID"}
            </div>
            <div className="grid justify-items-center gap-3 p-6 text-center">
              {data.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- user-uploaded, served from the API host
                <img src={data.avatarUrl} alt="" className="size-28 rounded-lg border border-border object-cover" />
              ) : (
                <div className="flex size-28 items-center justify-center rounded-lg border border-border bg-primary/10 text-3xl font-semibold text-primary">
                  {initials(data.name)}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold">{data.name}</h1>
                {data.role && <p className="mt-1 text-xs font-semibold tracking-[0.14em] text-primary uppercase">{data.role}</p>}
                {data.organization && <p className="mt-0.5 text-sm text-muted-foreground">{data.organization}</p>}
              </div>
              {data.employeeId && <p className="font-mono text-sm font-bold tracking-wide">{data.employeeId}</p>}
            </div>
          </>
        )}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Ugnexa Catalyst · ID verification</p>
    </main>
  );
}
