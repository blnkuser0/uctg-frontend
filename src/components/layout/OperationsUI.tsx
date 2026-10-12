import type { ReactNode } from "react";
import { ArrowUpRight, CalendarDays, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function OperationsHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return <header className="flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0"><p className="mb-2 flex items-center gap-2 text-xs font-medium text-cyan-700 dark:text-cyan-400"><CalendarDays className="size-3.5" />People & time</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1><p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p></div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </header>;
}

export function OperationsStat({ label, value, hint, accent = "bg-cyan-500" }: { label: string; value: ReactNode; hint: string; accent?: string }) {
  return <div className="min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-5"><p className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><span className={`size-2 shrink-0 rounded-full ${accent}`} />{label}</p><p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{value}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p></div>;
}

export function OperationsState({ loading, title, description, onRetry }: { loading?: boolean; title: string; description?: string; onRetry?: () => void }) {
  return <div role={loading ? "status" : undefined} className="rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center"><div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-muted"><CalendarDays className={`size-5 text-muted-foreground ${loading ? "animate-pulse" : ""}`} /></div><p className="text-sm font-semibold">{title}</p>{description && <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>}{onRetry && <Button variant="outline" className="mt-4 min-h-11" onClick={onRetry}><RefreshCw className="size-4" />Try again</Button>}</div>;
}

export function OperationsLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">{children}<ArrowUpRight className="size-4 text-muted-foreground" /></Link>;
}
