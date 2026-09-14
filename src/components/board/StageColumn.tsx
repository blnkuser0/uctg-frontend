"use client";

import { useDroppable } from "@dnd-kit/core";
import { Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DraggableTaskCard } from "./DraggableTaskCard";
import { cn } from "@/lib/utils";
import { Label } from "@/types/label";
import { Stage } from "@/types/stage";
import { Task } from "@/types/task";
import { User } from "@/types/user";

interface StageColumnProps {
  stage: Stage;
  tasks: Task[];
  projectKey: string;
  labels: Label[];
  members: User[];
  onTaskClick: (taskId: string) => void;
  onAddTask: (stageId: string) => void;
}

export function StageColumn({ stage, tasks, projectKey, labels, members, onTaskClick, onAddTask }: StageColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage._id });
  const overLimit = !!stage.wipLimit && tasks.length > stage.wipLimit;

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-2xl border border-border bg-muted/30">
      <div className="rounded-t-2xl border-t-4 bg-card px-3 py-2.5" style={{ borderTopColor: stage.color }}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{stage.name}</h3>
          <span
            className={cn(
              "flex items-center gap-1 text-xs",
              overLimit ? "font-semibold text-destructive" : "text-muted-foreground"
            )}
          >
            {overLimit && <AlertTriangle className="size-3" />}
            {tasks.length}
            {stage.wipLimit ? ` / ${stage.wipLimit}` : ""}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn("flex flex-1 flex-col gap-2 rounded-b-2xl p-2 transition-colors", isOver && "bg-cyan-500/10")}
      >
        {tasks.map((task) => (
          <DraggableTaskCard
            key={task._id}
            task={task}
            projectKey={projectKey}
            labels={labels}
            assignees={members}
            onClick={() => onTaskClick(task._id)}
          />
        ))}

        <Button
          variant="ghost"
          size="sm"
          className="justify-start text-muted-foreground"
          onClick={() => onAddTask(stage._id)}
        >
          <Plus className="size-4" />
          Add task
        </Button>
      </div>
    </div>
  );
}
