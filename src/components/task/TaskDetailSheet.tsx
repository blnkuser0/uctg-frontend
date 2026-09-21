"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRIORITY_LABELS } from "./priorityLabels";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TaskAssigneePicker } from "./TaskAssigneePicker";
import { TaskLabelPicker } from "./TaskLabelPicker";
import { TaskChecklist } from "./TaskChecklist";
import { TaskSubtasks } from "./TaskSubtasks";
import { TaskTimeTracking } from "./TaskTimeTracking";
import { TaskComments } from "./TaskComments";
import { TaskAttachments } from "./TaskAttachments";
import { useTask, useUpdateTask, useDeleteTask } from "@/hooks/useTask";
import { useStages } from "@/hooks/useStages";
import { useMoveTask } from "@/hooks/useTasks";
import { Task, TaskPriority } from "@/types/task";
import { Trash2 } from "lucide-react";

interface TaskDetailSheetProps {
  taskId: string | null;
  projectId: string;
  projectKey: string;
  memberIds: string[];
  onOpenChange: (open: boolean) => void;
  onOpenTask?: (taskId: string) => void;
}

export function TaskDetailSheet({ taskId, projectId, projectKey, memberIds, onOpenChange, onOpenTask }: TaskDetailSheetProps) {
  const { data: task } = useTask(taskId ?? "");

  return (
    <Sheet open={!!taskId} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {task && (
          <TaskDetailBody
            key={task._id}
            task={task}
            projectId={projectId}
            projectKey={projectKey}
            memberIds={memberIds}
            onDeleted={() => onOpenChange(false)}
            onOpenSubtask={(id) => onOpenTask?.(id)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function TaskDetailBody({
  task,
  projectId,
  projectKey,
  memberIds,
  onDeleted,
  onOpenSubtask,
}: {
  task: Task;
  projectId: string;
  projectKey: string;
  memberIds: string[];
  onDeleted: () => void;
  onOpenSubtask: (taskId: string) => void;
}) {
  const updateTask = useUpdateTask(task._id, projectId);
  const deleteTask = useDeleteTask(task._id, projectId);
  const stages = useStages(projectId);
  const moveTask = useMoveTask(projectId);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const priorityValue = task.priority ?? "normal";
  const stageValue = task.stageId ?? "";

  function saveField<T>(field: string, value: T) {
    updateTask.mutate({ [field]: value }, { onError: () => toast.error("Could not save changes.") });
  }

  function handleDelete() {
    if (!confirm("Delete this task?")) return;
    deleteTask.mutate(undefined, {
      onSuccess: onDeleted,
      onError: () => toast.error("Could not delete this task."),
    });
  }

  return (
    <>
      <SheetHeader>
        <div className="flex items-center justify-between gap-3 pr-8"><span className="font-mono text-xs text-muted-foreground">{projectKey}-{task.taskNumber}</span><span className="border border-violet-500/25 bg-violet-500/10 px-2 py-1 text-[10px] font-medium text-violet-700 dark:text-violet-300">{stages.data?.find((stage) => stage._id === task.stageId)?.name ?? "Loading status"}</span></div>
        <SheetTitle className="sr-only">{task.title}</SheetTitle>
      </SheetHeader>
      <div className="px-4 pb-6">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title.trim() && title !== task.title && saveField("title", title.trim())}
          className="border-none px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
        />

        <Tabs defaultValue="details" className="mt-2">
          <TabsList className="w-full justify-start overflow-x-auto [&::-webkit-scrollbar]:hidden">
            <TabsTrigger value="details" className="shrink-0">Details</TabsTrigger>
            <TabsTrigger value="checklist" className="shrink-0">Checklist</TabsTrigger>
            <TabsTrigger value="subtasks" className="shrink-0">Subtasks</TabsTrigger>
            <TabsTrigger value="time" className="shrink-0">Time</TabsTrigger>
            <TabsTrigger value="attachments" className="shrink-0">Files{task.attachments.length > 0 ? ` (${task.attachments.length})` : ""}</TabsTrigger>
            <TabsTrigger value="comments" className="shrink-0">
              Comments{task.commentCount > 0 ? ` (${task.commentCount})` : ""}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="grid gap-4 pt-3">
            <div className="grid gap-1.5 border border-border bg-muted/25 p-3">
              <Label>Current status</Label>
              <Select
                value={stageValue}
                onValueChange={(stageId) => {
                  if (!stageId) return;
                  moveTask.mutate({ taskId: task._id, stageId, order: 0 }, {
                    onSuccess: () => toast.success("Task status updated"),
                    onError: () => toast.error("Could not update task status"),
                  });
                }}
              >
                <SelectTrigger className="bg-background"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>{(stages.data ?? []).map((stage) => <SelectItem key={stage._id} value={stage._id}>{stage.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Description</Label>
              <Textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => description !== task.description && saveField("description", description)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Priority</Label>
                <Select value={priorityValue} items={PRIORITY_LABELS} onValueChange={(v) => saveField("priority", v as TaskPriority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Assignees</Label>
                <TaskAssigneePicker
                  memberIds={memberIds}
                  selected={task.assigneeIds}
                  onChange={(ids) => saveField("assigneeIds", ids)}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label>Labels</Label>
              <TaskLabelPicker projectId={projectId} selected={task.labelIds} onChange={(ids) => saveField("labelIds", ids)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Start date</Label>
                <Input
                  type="date"
                  defaultValue={task.startDate?.slice(0, 10) ?? ""}
                  onBlur={(e) => saveField("startDate", e.target.value || null)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Deadline</Label>
                <Input
                  type="date"
                  defaultValue={task.deadline?.slice(0, 10) ?? ""}
                  onBlur={(e) => saveField("deadline", e.target.value || null)}
                />
              </div>
            </div>

            <Button variant="outline" className="mt-2 text-destructive hover:text-destructive" onClick={handleDelete}>
              <Trash2 className="size-4" />
              Delete task
            </Button>
          </TabsContent>

          <TabsContent value="checklist" className="pt-3">
            <TaskChecklist task={task} projectId={projectId} />
          </TabsContent>

          <TabsContent value="subtasks" className="pt-3">
            <TaskSubtasks taskId={task._id} projectId={projectId} projectKey={projectKey} onOpenSubtask={onOpenSubtask} />
          </TabsContent>

          <TabsContent value="time" className="pt-3">
            <TaskTimeTracking taskId={task._id} trackedMinutes={task.trackedMinutes} estimateMinutes={task.estimateMinutes} />
          </TabsContent>

          <TabsContent value="attachments" className="pt-3">
            <TaskAttachments taskId={task._id} projectId={projectId} attachments={task.attachments} />
          </TabsContent>

          <TabsContent value="comments" className="pt-3">
            <TaskComments taskId={task._id} memberIds={memberIds} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
