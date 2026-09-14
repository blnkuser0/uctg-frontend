"use client";

import { ArrowRightLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { LabelBadge } from "@/components/labels/LabelBadge";
import { TaskPriorityFlag } from "@/components/task/TaskPriorityFlag";
import { TaskDeadlinePill } from "@/components/task/TaskDeadlinePill";
import { Label } from "@/types/label";
import { Task } from "@/types/task";
import { User } from "@/types/user";

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface TaskCardProps {
  task: Task;
  projectKey: string;
  labels: Label[];
  assignees: User[];
  onClick: () => void;
  onMoveClick?: () => void;
}

export function TaskCard({ task, projectKey, labels, assignees, onClick, onMoveClick }: TaskCardProps) {
  const taskLabels = labels.filter((l) => task.labelIds.includes(l._id));
  const taskAssignees = assignees.filter((u) => task.assigneeIds.includes(u.id));

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="flex w-full flex-col gap-2 rounded-xl border border-border bg-card p-3 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-muted-foreground">
          {projectKey}-{task.taskNumber}
        </span>
        <div className="flex items-center gap-2">
          <TaskPriorityFlag priority={task.priority} />
          {onMoveClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveClick();
              }}
              aria-label="Move task"
              className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            >
              <ArrowRightLeft className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <p className="text-sm font-medium leading-snug">{task.title}</p>

      {taskLabels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {taskLabels.map((l) => (
            <LabelBadge key={l._id} label={l} />
          ))}
        </div>
      )}

      {task.checklist.length > 0 && (
        <div className="flex items-center gap-2">
          <Progress value={task.checklistProgress} className="h-1" />
          <span className="text-[10px] text-muted-foreground">{task.checklistProgress}%</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <TaskDeadlinePill deadline={task.deadline} />
        <div className="flex -space-x-1.5">
          {taskAssignees.slice(0, 3).map((u) => (
            <Avatar key={u.id} className="size-5 border border-background">
              <AvatarFallback className="bg-amber-500/20 text-[9px] text-amber-700">{initials(u.name)}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>
    </div>
  );
}
