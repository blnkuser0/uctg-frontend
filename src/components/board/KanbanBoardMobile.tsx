"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TaskCard } from "./TaskCard";
import { MoveTaskSheet } from "./MoveTaskSheet";
import { NewTaskDialog } from "@/components/task/NewTaskDialog";
import { TaskDetailSheet } from "@/components/task/TaskDetailSheet";
import { useStages } from "@/hooks/useStages";
import { useTasks, useMoveTask } from "@/hooks/useTasks";
import { useLabels } from "@/hooks/useLabels";
import { useUsers } from "@/hooks/useUsers";
import { Project } from "@/types/project";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

export function KanbanBoardMobile({ project }: { project: Project }) {
  const { data: stages } = useStages(project._id);
  const { data: tasks } = useTasks(project._id);
  const { data: labels } = useLabels(project._id);
  const { data: users } = useUsers();
  const moveTask = useMoveTask(project._id);

  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [movingTaskId, setMovingTaskId] = useState<string | null>(null);
  const [newTaskStageId, setNewTaskStageId] = useState<string | null>(null);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const members = (users ?? []).filter((u) => project.memberIds.includes(u.id));
  const currentStageId = activeStageId ?? stages?.[0]?._id ?? null;
  const stageTasks = (tasks ?? []).filter((t) => t.stageId === currentStageId);
  const movingTask = (tasks ?? []).find((t) => t._id === movingTaskId) ?? null;

  function handleMove(stageId: string) {
    if (!movingTaskId) return;
    const targetTasks = (tasks ?? []).filter((t) => t.stageId === stageId);
    const newOrder = targetTasks.length > 0 ? Math.max(...targetTasks.map((t) => t.order)) + 1 : 0;

    const targetStage = (stages ?? []).find((s) => s._id === stageId);
    if (targetStage?.wipLimit && targetTasks.length + 1 > targetStage.wipLimit) {
      toast.warning(`${targetStage.name} is now over its WIP limit (${targetTasks.length + 1}/${targetStage.wipLimit})`);
    }

    moveTask.mutate(
      { taskId: movingTaskId, stageId, order: newOrder },
      {
        onSuccess: () => setMovingTaskId(null),
        onError: () => toast.error("Could not move that task."),
      }
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-1.5 overflow-x-auto border-b border-border px-3 py-2 [&::-webkit-scrollbar]:hidden">
        {(stages ?? []).map((stage) => {
          const count = (tasks ?? []).filter((t) => t.stageId === stage._id).length;
          const active = stage._id === currentStageId;
          const overLimit = !!stage.wipLimit && count > stage.wipLimit;
          return (
            <button
              key={stage._id}
              onClick={() => setActiveStageId(stage._id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
                active
                  ? "bg-cyan-600 text-white"
                  : overLimit
                    ? "bg-destructive/15 text-destructive"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {stage.name} · {count}
              {stage.wipLimit ? `/${stage.wipLimit}` : ""}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid gap-2">
          {stageTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              projectKey={project.key}
              labels={labels ?? []}
              assignees={members}
              onClick={() => setOpenTaskId(task._id)}
              onMoveClick={() => setMovingTaskId(task._id)}
            />
          ))}
          {currentStageId && (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-muted-foreground"
              onClick={() => setNewTaskStageId(currentStageId)}
            >
              <Plus className="size-4" />
              Add task
            </Button>
          )}
        </div>
      </div>

      <MoveTaskSheet
        task={movingTask}
        stages={stages ?? []}
        onMove={handleMove}
        onOpenChange={(open) => !open && setMovingTaskId(null)}
      />
      <NewTaskDialog
        projectId={project._id}
        stageId={newTaskStageId}
        memberIds={project.memberIds}
        onOpenChange={(open) => !open && setNewTaskStageId(null)}
      />
      <TaskDetailSheet
        taskId={openTaskId}
        projectId={project._id}
        projectKey={project.key}
        memberIds={project.memberIds}
        onOpenChange={(open) => !open && setOpenTaskId(null)}
        onOpenTask={setOpenTaskId}
      />
    </div>
  );
}
