"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskAssigneePicker } from "./TaskAssigneePicker";
import { useCreateTask } from "@/hooks/useTasks";
import { TaskPriority } from "@/types/task";

interface NewTaskDialogProps {
  projectId: string;
  stageId: string | null;
  memberIds: string[];
  onOpenChange: (open: boolean) => void;
}

export function NewTaskDialog({ projectId, stageId, memberIds, onOpenChange }: NewTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const createTask = useCreateTask(projectId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stageId || !title.trim()) return;

    createTask.mutate(
      {
        stageId,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        assigneeIds,
        startDate: startDate || null,
        deadline: deadline || null,
      },
      {
        onSuccess: () => onOpenChange(false),
        onError: () => toast.error("Could not create the task."),
      }
    );
  }

  return (
    <Dialog open={!!stageId} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1.5">
            <Label htmlFor="taskTitle">Title</Label>
            <Input id="taskTitle" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="taskDescription">Description</Label>
            <Textarea id="taskDescription" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Priority</Label>
              <Select value={priority ?? undefined} onValueChange={(v) => setPriority(v as TaskPriority)}>
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
              <TaskAssigneePicker memberIds={memberIds} selected={assigneeIds} onChange={setAssigneeIds} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createTask.isPending} className="bg-cyan-600 text-white hover:bg-cyan-500">
              {createTask.isPending ? "Creating..." : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
