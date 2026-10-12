"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, formatClockTime } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { ClockState, TimeLog, TimeLogType } from "@/types/timeLog";
import { Clock, Coffee, LogIn, LogOut, Moon, Play } from "lucide-react";

// A nap started via the Nap button is still a plain break-in/break-out under the hood (same
// backend state machine) — tagged with this note so it's distinguishable after a refresh too.
const NAP_NOTE = "nap";
const NAP_LIMIT_MS = 30 * 60 * 1000;
const BREAK_LIMIT_MS = 60 * 60 * 1000;

interface ElapsedState {
  workedMs: number; // completed (closed) work intervals, excluding whatever's currently open
  workStartAt: number | null; // epoch ms of the open work interval's start, if currently "working"
  breakMs: number; // completed break intervals
  breakStartAt: number | null; // epoch ms of the open break's start, if currently "on-break"
  breakIsNap: boolean; // whether the currently-open break was started via the Nap button
  firstTimeIn: string | null;
  lastTimeOut: string | null;
}

/** Same server-gives-truth, client-interpolates split used for the live ticking display below:
 *  sum up everything already closed, and separately track when the current (still-open)
 *  interval started so a 1s local interval can compute "elapsed so far" without re-fetching. */
function computeElapsed(logs: TimeLog[]): ElapsedState {
  const sorted = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  let workedMs = 0;
  let breakMs = 0;
  let workStart: number | null = null;
  let breakStart: number | null = null;
  let breakIsNap = false;
  let firstTimeIn: string | null = null;
  let lastTimeOut: string | null = null;

  for (const log of sorted) {
    const t = new Date(log.timestamp).getTime();
    if (log.type === "time-in") {
      workStart = t;
      firstTimeIn ??= log.timestamp;
    } else if (log.type === "break-in" && workStart !== null) {
      workedMs += t - workStart;
      workStart = null;
      breakStart = t;
      breakIsNap = log.note === NAP_NOTE;
    } else if (log.type === "break-out" && breakStart !== null) {
      breakMs += t - breakStart;
      breakStart = null;
      breakIsNap = false;
      workStart = t;
    } else if (log.type === "time-out" && workStart !== null) {
      workedMs += t - workStart;
      workStart = null;
      lastTimeOut = log.timestamp;
    }
  }

  return { workedMs, workStartAt: workStart, breakMs, breakStartAt: breakStart, breakIsNap, firstTimeIn, lastTimeOut };
}

function pad(n: number): string {
  return String(Math.max(0, n)).padStart(2, "0");
}

function toHMS(ms: number): { h: number; m: number; s: number } {
  const totalSeconds = Math.floor(ms / 1000);
  return { h: Math.floor(totalSeconds / 3600), m: Math.floor((totalSeconds % 3600) / 60), s: totalSeconds % 60 };
}

const STATE_META: Record<ClockState, { label: string; dot: string; text: string }> = {
  "clocked-out": { label: "Off Clock", dot: "bg-muted-foreground", text: "text-muted-foreground" },
  working: { label: "On Shift", dot: "bg-emerald-500 animate-pulse", text: "text-emerald-500" },
  "on-break": { label: "On Break", dot: "bg-amber-400 animate-pulse", text: "text-amber-500" },
};

export function TimeClockCard({
  logs,
  state,
  onAction,
  isPending,
}: {
  logs: TimeLog[];
  state: ClockState;
  onAction: (type: TimeLogType, note?: string) => void;
  isPending?: boolean;
}) {
  const { user } = useAuth();
  const isNightShift = user?.shiftType === "night";

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const [confirmEndShift, setConfirmEndShift] = useState(false);

  const elapsed = useMemo(() => computeElapsed(logs), [logs]);
  const liveWorkMs = elapsed.workStartAt !== null ? Math.max(0, now - elapsed.workStartAt) : 0;
  const totalWorkMs = elapsed.workedMs + liveWorkMs;
  const liveBreakMs = elapsed.breakStartAt !== null ? Math.max(0, now - elapsed.breakStartAt) : 0;
  const totalBreakMs = elapsed.breakMs + liveBreakMs;

  const isNapping = state === "on-break" && elapsed.breakIsNap;
  const breakLimitMs = isNapping ? NAP_LIMIT_MS : BREAK_LIMIT_MS;
  const overBreakLimit = state === "on-break" && liveBreakMs >= breakLimitMs;

  // While on break, the big display swaps to show how long THIS break (or nap) has run — work
  // time keeps accumulating in the background (frozen) and reappears once resumed, same as
  // Suprah's pattern.
  const displayMs = state === "on-break" ? totalBreakMs : totalWorkMs;
  const { h, m, s } = toHMS(displayMs);
  const worked = toHMS(totalWorkMs);
  const meta = STATE_META[state];
  const breakLabel = isNapping ? "Napping" : "On Break";

  function handleEndShiftConfirm() {
    onAction("time-out");
    setConfirmEndShift(false);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-cyan-500/20 bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <span className="flex items-center gap-2 text-[11px] font-black tracking-[0.2em] text-muted-foreground uppercase">
          <Clock className="size-4" />
          Time Clock
        </span>
        <span className="flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full", state === "on-break" ? "bg-amber-400 animate-pulse" : meta.dot)} />
          <span className={cn("text-[11px] font-bold tracking-wider uppercase", meta.text)}>
            {state === "on-break" ? breakLabel : meta.label}
          </span>
        </span>
      </div>

      <div className="flex flex-col items-center gap-3 bg-gradient-to-br from-cyan-500/5 via-transparent to-emerald-500/5 px-4 py-10 sm:py-12">
        <span className="text-xs font-medium text-muted-foreground">
          {state === "on-break" ? (isNapping ? "Nap time (30 min)" : "Total break time") : "Total work time"}
        </span>
        <div
          className={cn(
            "font-mono text-[clamp(2.5rem,7vw,4.5rem)] leading-none font-medium tracking-tighter tabular-nums",
            state === "on-break"
              ? overBreakLimit
                ? "text-red-500"
                : "text-amber-500"
              : state === "clocked-out"
                ? "text-muted-foreground"
                : "text-foreground"
          )}
        >
          {pad(h)}:{pad(m)}:{pad(s)}
        </div>
        {state === "on-break" && (
          <span className={cn("font-mono text-xs font-bold", overBreakLimit ? "text-red-500" : "text-muted-foreground")}>
            {overBreakLimit
              ? `Over the ${isNapping ? "30-min nap" : "60-min break"} limit`
              : `Worked this shift: ${pad(worked.h)}h ${pad(worked.m)}m`}
          </span>
        )}
      </div>

      <div className="border-t border-border bg-muted/20 px-5 py-4">
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-card px-3 py-2.5">
            <p className="mb-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Time In</p>
            <p className="font-mono text-lg leading-none font-black tabular-nums">
              {elapsed.firstTimeIn ? formatClockTime(elapsed.firstTimeIn) : "——"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-3 py-2.5">
            <p className="mb-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Time Out</p>
            <p className="font-mono text-lg leading-none font-black tabular-nums">
              {elapsed.lastTimeOut ? formatClockTime(elapsed.lastTimeOut) : "——"}
            </p>
          </div>
        </div>

        <div className={cn("grid gap-2", state === "working" && isNightShift ? "grid-cols-3" : "grid-cols-2")}>
          {state === "clocked-out" && (
            <Button
              disabled={isPending}
              onClick={() => onAction("time-in")}
              className="col-span-2 h-12 bg-cyan-600 text-white hover:bg-cyan-500"
            >
              <LogIn className="size-4" />
              Start Shift
            </Button>
          )}
          {state === "working" && (
            <>
              <Button
                variant="outline"
                disabled={isPending}
                onClick={() => onAction("break-in")}
                className="h-11 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
              >
                <Coffee className="size-4" />
                Break
              </Button>
              {isNightShift && (
                <Button
                  variant="outline"
                  disabled={isPending}
                  onClick={() => onAction("break-in", NAP_NOTE)}
                  className="h-11 border-violet-500/30 text-violet-600 hover:bg-violet-500/10"
                >
                  <Moon className="size-4" />
                  Nap
                </Button>
              )}
              <Button
                variant="outline"
                disabled={isPending}
                onClick={() => setConfirmEndShift(true)}
                className="h-11 border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <LogOut className="size-4" />
                End Shift
              </Button>
            </>
          )}
          {state === "on-break" && (
            <Button
              disabled={isPending}
              onClick={() => onAction("break-out")}
              className="col-span-2 h-12 bg-amber-600 text-white hover:bg-amber-700"
            >
              <Play className="size-4" />
              Resume
            </Button>
          )}
        </div>
      </div>

      <Dialog open={confirmEndShift} onOpenChange={setConfirmEndShift}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>End your shift?</DialogTitle>
            <DialogDescription>Are you sure you want to end your shift? This records your time out now.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmEndShift(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleEndShiftConfirm} disabled={isPending}>
              <LogOut className="size-4" />
              End Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
