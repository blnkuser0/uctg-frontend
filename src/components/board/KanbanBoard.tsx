"use client";

import { useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { toast } from "sonner";
import { StageColumn } from "./StageColumn";
import { NewStageButton } from "./NewStageButton";
import { TaskCard } from "./TaskCard";
import { NewTaskDialog } from "@/components/task/NewTaskDialog";
import { TaskDetailSheet } from "@/components/task/TaskDetailSheet";
import { useStages } from "@/hooks/useStages";
import { useTasks, useMoveTask } from "@/hooks/useTasks";
import { useLabels } from "@/hooks/useLabels";
import { useUsers } from "@/hooks/useUsers";
import { Project } from "@/types/project";

export function KanbanBoard({ project }: { project: Project }) {
  const { data: stages } = useStages(project._id);
  const { data: tasks } = useTasks(project._id);
  const { data: labels } = useLabels(project._id);
  const { data: users } = useUsers();
  const moveTask = useMoveTask(project._id);

  const [newTaskStageId, setNewTaskStageId] = useState<string | null>(null);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const members = (users ?? []).filter((u) => project.memberIds.includes(u.id));
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const activeTask = (tasks ?? []).find((t) => t._id === activeTaskId) ?? null;

  function handleDragStart(event: DragStartEvent) {
    setActiveTaskId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTaskId(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const targetStageId = over.id as string;
    const task = (tasks ?? []).find((t) => t._id === taskId);
    if (!task || task.stageId === targetStageId) return;

    const targetTasks = (tasks ?? []).filter((t) => t.stageId === targetStageId);
    const newOrder = targetTasks.length > 0 ? Math.max(...targetTasks.map((t) => t.order)) + 1 : 0;

    const targetStage = (stages ?? []).find((s) => s._id === targetStageId);
    if (targetStage?.wipLimit && targetTasks.length + 1 > targetStage.wipLimit) {
      toast.warning(`${targetStage.name} is now over its WIP limit (${targetTasks.length + 1}/${targetStage.wipLimit})`);
    }

    moveTask.mutate(
      { taskId, stageId: targetStageId, order: newOrder },
      { onError: () => toast.error("Could not move that task.") }
    );
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full gap-3 overflow-x-auto p-4 md:p-6">
        {(stages ?? []).map((stage) => (
          <StageColumn
            key={stage._id}
            stage={stage}
            tasks={(tasks ?? []).filter((t) => t.stageId === stage._id)}
            projectKey={project.key}
            labels={labels ?? []}
            members={members}
            onTaskClick={setOpenTaskId}
            onAddTask={setNewTaskStageId}
          />
        ))}
        <NewStageButton projectId={project._id} />

        <NewTaskDialog
          projectId={project._id}
          stageId={newTaskStageId}
          stageName={(stages ?? []).find((stage) => stage._id === newTaskStageId)?.name}
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

      <DragOverlay>
        {activeTask && (
          <TaskCard
            task={activeTask}
            projectKey={project.key}
            labels={labels ?? []}
            assignees={members}
            onClick={() => {}}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
