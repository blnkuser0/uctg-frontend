"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/AuthProvider";
import { useTimeEntries, useStartTimer, useStopTimer, useCreateManualEntry, useDeleteTimeEntry } from "@/hooks/useTimeEntries";
import { Play, Square, Trash2 } from "lucide-react";

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function TaskTimeTracking({ taskId, trackedMinutes, estimateMinutes }: { taskId: string; trackedMinutes: number; estimateMinutes: number | null }) {
  const { user } = useAuth();
  const { data: entries } = useTimeEntries(taskId);
  const startTimer = useStartTimer(taskId);
  const stopTimer = useStopTimer(taskId);
  const createManual = useCreateManualEntry(taskId);
  const deleteEntry = useDeleteTimeEntry(taskId);

  const [manualStart, setManualStart] = useState("");
  const [manualEnd, setManualEnd] = useState("");

  const myRunningEntry = (entries ?? []).find((e) => e.userId === user?.id && e.endedAt === null);

  function handleStart() {
    startTimer.mutate(undefined, { onError: () => toast.error("Could not start the timer.") });
  }

  function handleStop() {
    stopTimer.mutate(undefined, { onError: () => toast.error("Could not stop the timer.") });
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualStart || !manualEnd) return;
    createManual.mutate(
      { startedAt: manualStart, endedAt: manualEnd },
      {
        onSuccess: () => {
          setManualStart("");
          setManualEnd("");
        },
        onError: () => toast.error("End time must be after the start time."),
      }
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-3">
        <div>
          <p className="text-xs text-muted-foreground">Tracked</p>
          <p className="text-lg font-semibold">
            {formatMinutes(trackedMinutes)}
            {estimateMinutes ? <span className="text-sm font-normal text-muted-foreground"> / {formatMinutes(estimateMinutes)}</span> : null}
          </p>
        </div>
        {myRunningEntry ? (
          <Button onClick={handleStop} variant="outline" className="text-destructive hover:text-destructive">
            <Square className="size-4" />
            Stop
          </Button>
        ) : (
          <Button onClick={handleStart} className="bg-amber-500 text-stone-900 hover:bg-amber-400">
            <Play className="size-4" />
            Start timer
          </Button>
        )}
      </div>

      <form onSubmit={handleManualSubmit} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
        <div className="grid gap-1">
          <Label className="text-xs">Start</Label>
          <Input type="datetime-local" value={manualStart} onChange={(e) => setManualStart(e.target.value)} />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">End</Label>
          <Input type="datetime-local" value={manualEnd} onChange={(e) => setManualEnd(e.target.value)} />
        </div>
        <Button type="submit" size="sm" variant="outline">
          Log
        </Button>
      </form>

      <div className="grid gap-1">
        {(entries ?? []).map((entry) => (
          <div key={entry._id} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted">
            <span className="text-muted-foreground">
              {entry.source === "timer" ? "Timer" : "Manual"} ·{" "}
              {entry.durationMinutes !== null ? formatMinutes(entry.durationMinutes) : "running..."}
            </span>
            {entry.userId === user?.id && (
              <button onClick={() => deleteEntry.mutate(entry._id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="size-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
