"use client";

import Image from "next/image";
import { Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { IdCardData } from "@/types/idCard";

const subscribeNothing = () => () => undefined;

// The QR code is printed, so it must point at the real public site no matter
// where the card was rendered (e.g. someone printing from localhost or a
// preview URL). Set NEXT_PUBLIC_APP_URL to the production URL to guarantee it.
function useOrigin() {
  return useSyncExternalStore(
    subscribeNothing,
    () => (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/+$/, ""),
    () => ""
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// A company ID is a printed object, so it stays light-themed in dark mode and
// uses fixed colors rather than the app's theme tokens.
function CardFace({ card, origin }: { card: IdCardData; origin: string }) {
  const verifyUrl = `${origin}/verify/${card.verifyToken}`;
  const issued = new Date(card.issuedAt).toLocaleDateString(undefined, { month: "short", year: "numeric" });

  return (
    <div className="relative flex aspect-[54/86] w-[16.5rem] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-lg">
      <div className="h-2.5 shrink-0 bg-cyan-600" />
      <div className="flex justify-center px-5 pt-3">
        <Image
          src="/assets/branding/logo-landscape.jpg"
          alt="Ugnexa Catalyst"
          width={1500}
          height={500}
          className="h-9 w-auto"
          priority
        />
      </div>

      <div className="mt-3 flex justify-center">
        {card.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- user-uploaded, served from the API host
          <img src={card.avatarUrl} alt="" className="size-28 rounded-lg border-2 border-cyan-600 object-cover" />
        ) : (
          <div className="flex size-28 items-center justify-center rounded-lg border-2 border-cyan-600 bg-cyan-50 text-3xl font-semibold text-cyan-700">
            {initials(card.name)}
          </div>
        )}
      </div>

      <div className="mt-3 px-4 text-center">
        <p className="text-lg leading-tight font-bold break-words">{card.name}</p>
        {card.role && <p className="mt-1 text-[11px] font-semibold tracking-[0.14em] text-cyan-700 uppercase">{card.role}</p>}
        {card.organization && <p className="mt-0.5 text-[11px] text-slate-500">{card.organization}</p>}
      </div>

      <div className="mt-auto flex items-end justify-between gap-2 px-4 pb-3">
        <div className="min-w-0">
          <p className="text-[8px] font-semibold tracking-[0.16em] text-slate-400 uppercase">ID No.</p>
          <p className="font-mono text-base font-bold tracking-wide">{card.employeeId}</p>
          <p className="mt-1 text-[8px] text-slate-400">Issued {issued}</p>
        </div>
        <div className="shrink-0 rounded-md border border-slate-200 bg-white p-1.5">
          {origin ? <QRCodeSVG value={verifyUrl} size={72} level="M" marginSize={0} /> : <div className="size-[72px]" />}
        </div>
      </div>

      <div className="shrink-0 bg-slate-900 py-1.5 text-center text-[8px] font-medium tracking-[0.2em] text-white uppercase">
        Scan to verify
      </div>

      {!card.isActive && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 -rotate-12 bg-red-600/90 py-1.5 text-center text-sm font-bold tracking-[0.3em] text-white">
          INACTIVE
        </div>
      )}
    </div>
  );
}

export function IdCard({ card }: { card: IdCardData }) {
  const origin = useOrigin();

  return (
    <div className="flex flex-col items-center gap-4">
      <CardFace card={card} origin={origin} />
      <Button type="button" variant="outline" onClick={() => window.print()}>
        <Printer className="size-4" />
        Print / Save as PDF
      </Button>
      {/* Printing hides everything but this copy, which lives directly under
          <body> so no dialog transform can shift it (see .id-card-print-root). */}
      {origin && createPortal(<div className="id-card-print-root"><CardFace card={card} origin={origin} /></div>, document.body)}
    </div>
  );
}
