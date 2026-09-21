"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FileImage, Paperclip, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRIORITY_LABELS } from "./priorityLabels";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskAssigneePicker } from "./TaskAssigneePicker";
import { useCreateTask } from "@/hooks/useTasks";
import { TaskPriority } from "@/types/task";
import { addAttachments } from "@/services/task.service";

interface NewTaskDialogProps {
  projectId: string;
  stageId: string | null;
  stageName?: string;
  memberIds: string[];
  onOpenChange: (open: boolean) => void;
}

export function NewTaskDialog({ projectId, stageId, stageName, memberIds, onOpenChange }: NewTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createTask = useCreateTask(projectId);
  const queryClient = useQueryClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stageId || !title.trim()) return;

    try {
      const task = await createTask.mutateAsync({
        stageId,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        assigneeIds,
        startDate: startDate || null,
        deadline: deadline || null,
      });
      if (files.length > 0) await addAttachments(task._id, files);
      await queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tasks"] });
      toast.success(files.length > 0 ? `Task created with ${files.length} attachment${files.length === 1 ? "" : "s"}` : "Task created");
      onOpenChange(false);
    } catch {
      toast.error("Could not create the task or upload its attachments.");
    }
  }

  return (
    <Dialog open={!!stageId} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto border-t-2 border-t-violet-500 p-0">
        <DialogHeader className="border-b border-border bg-violet-500/7 px-5 py-4">
          <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-medium text-muted-foreground">Create work item</p><DialogTitle className="mt-1 text-xl font-bold">New task</DialogTitle></div><span className="border border-violet-500/25 bg-violet-500/10 px-2.5 py-1 text-[10px] font-medium text-violet-700 dark:text-violet-300">{stageName ?? "Selected stage"}</span></div>
        </DialogHeader>
        <form className="grid gap-4 p-5" onSubmit={handleSubmit}>
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
              <Select value={priority ?? undefined} items={PRIORITY_LABELS} onValueChange={(v) => setPriority(v as TaskPriority)}>
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
          <div className="grid gap-2 border border-dashed border-border bg-muted/25 p-3">
            <div className="flex items-center justify-between gap-3"><div><Label>Attachments</Label><p className="mt-0.5 text-[11px] text-muted-foreground">Add screenshots, images, PDFs, or supporting files now.</p></div><Button type="button" size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}><Paperclip className="size-3.5" />Choose files</Button></div>
            <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" className="hidden" onChange={(event) => setFiles((current) => [...current, ...Array.from(event.target.files ?? [])].slice(0, 10))} />
            {files.length > 0 && <div className="grid gap-1.5 sm:grid-cols-2">{files.map((file, index) => <div key={`${file.name}-${index}`} className="flex min-w-0 items-center gap-2 border border-border bg-card px-2.5 py-2"><FileImage className="size-3.5 shrink-0 text-violet-500" /><span className="min-w-0 flex-1 truncate text-[11px]">{file.name}</span><button type="button" onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} aria-label={`Remove ${file.name}`} className="text-muted-foreground hover:text-destructive"><X className="size-3.5" /></button></div>)}</div>}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createTask.isPending} className="bg-violet-600 text-white hover:bg-violet-500">
              {createTask.isPending ? "Creating and uploading..." : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
