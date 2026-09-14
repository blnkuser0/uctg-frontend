"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Stage } from "@/types/stage";
import { Task } from "@/types/task";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MoveTaskSheetProps {
  task: Task | null;
  stages: Stage[];
  onMove: (stageId: string) => void;
  onOpenChange: (open: boolean) => void;
}

export function MoveTaskSheet({ task, stages, onMove, onOpenChange }: MoveTaskSheetProps) {
  return (
    <Sheet open={!!task} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[70vh]">
        <SheetHeader>
          <SheetTitle className="text-sm">Move &quot;{task?.title}&quot; to...</SheetTitle>
        </SheetHeader>
        <div className="grid gap-1 px-4 pb-6">
          {stages.map((stage) => {
            const isCurrent = stage._id === task?.stageId;
            return (
              <button
                key={stage._id}
                disabled={isCurrent}
                onClick={() => onMove(stage._id)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm",
                  isCurrent ? "text-muted-foreground" : "hover:bg-muted"
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                  {stage.name}
                </span>
                {isCurrent && <Check className="size-4" />}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
