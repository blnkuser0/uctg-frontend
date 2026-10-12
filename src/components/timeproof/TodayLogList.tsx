"use client";
import { Clock3, Coffee, LogIn, LogOut, Play } from "lucide-react";
import { formatClockTime } from "@/lib/utils";
import { TimeLog } from "@/types/timeLog";
const META = {
  "time-in": { label: "Shift started", icon: LogIn, color: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400" },
  "time-out": { label: "Shift ended", icon: LogOut, color: "bg-muted text-muted-foreground" },
  "break-in": { label: "Break started", icon: Coffee, color: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  "break-out": { label: "Back to work", icon: Play, color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
};
export function TodayLogList({ logs }: { logs: TimeLog[] }) {
  return <section className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card">
    <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4"><div><h2 className="text-sm font-semibold">Shift activity</h2><p className="mt-1 text-xs text-muted-foreground">Your latest activity, first.</p></div><span className="rounded-full bg-muted px-2.5 py-1 text-xs tabular-nums">{logs.length} {logs.length === 1 ? "event" : "events"}</span></div>
    {logs.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center"><Clock3 className="mb-3 size-7 text-muted-foreground/50" /><p className="text-sm font-medium">A fresh start</p><p className="mt-1 max-w-56 text-xs leading-relaxed text-muted-foreground">Start your shift to see your work and break activity here.</p></div> : <ol className="max-h-96 overflow-y-auto px-5 py-2">{[...logs].reverse().map((log, index) => { const meta = META[log.type]; const Icon = meta.icon; return <li key={log._id} className="relative flex gap-3 py-3">
      {index < logs.length - 1 && <span aria-hidden className="absolute top-12 bottom-[-12px] left-[17px] w-px bg-border" />}
      <span className={"relative flex size-9 shrink-0 items-center justify-center rounded-xl " + meta.color}><Icon className="size-4" /></span><div className="min-w-0 flex-1"><p className="text-sm font-medium">{meta.label}</p><p className="mt-0.5 text-xs text-muted-foreground">{formatClockTime(log.timestamp)} · {new Date(log.timestamp).toLocaleDateString("en-PH", { month: "short", day: "numeric", timeZone: "Asia/Manila" })}</p></div>{index === 0 && <span className="self-start rounded-full bg-muted px-2 py-1 text-[10px] text-muted-foreground">Latest</span>}
    </li>; })}</ol>}
  </section>;
}
