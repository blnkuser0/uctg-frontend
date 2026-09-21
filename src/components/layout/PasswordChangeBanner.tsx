"use client";

import Link from "next/link";
import { KeyRound } from "lucide-react";

// Shown while an account is still using the temporary password an admin
// emailed it. Clears itself once the user changes their password.
export function PasswordChangeBanner() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-800 sm:px-6 lg:px-8 dark:text-amber-200">
      <KeyRound className="size-3.5 shrink-0" />
      <span className="min-w-0 flex-1">You&apos;re still using a temporary password. Please set your own now.</span>
      <Link href="/profile" className="font-semibold underline underline-offset-2">
        Change password
      </Link>
    </div>
  );
}
