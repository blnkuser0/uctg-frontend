"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSubtasks, useCreateSubtask } from "@/hooks/useTask";
import { Plus } from "lucide-react";

const STATUS_META: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  done: "bg-emerald-500/15 text-emerald-600",
};

export function TaskSubtasks({
  taskId,
  projectId,
  projectKey,
  onOpenSubtask,
}: {
  taskId: string;
  projectId: string;
  projectKey: string;
  onOpenSubtask: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const { data: subtasks } = useSubtasks(taskId);
  const createSubtask = useCreateSubtask(taskId, projectId);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    createSubtask.mutate(
      { title: title.trim() },
      { onSuccess: () => setTitle(""), onError: () => toast.error("Could not create the subtask.") }
    );
  }

  return (
    <div className="grid gap-2">
      {(subtasks ?? []).map((subtask) => (
        <button
          key={subtask._id}
          onClick={() => onOpenSubtask(subtask._id)}
          className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-left hover:bg-muted"
        >
          <span className="flex items-center gap-2 text-sm">
            <span className="font-mono text-[10px] text-muted-foreground">
              {projectKey}-{subtask.taskNumber}
            </span>
            {subtask.title}
          </span>
          <Badge className={STATUS_META[subtask.completedAt ? "done" : "pending"]}>
            {subtask.completedAt ? "Done" : "Open"}
          </Badge>
        </button>
      ))}

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input placeholder="Add a subtask" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Button type="submit" size="sm" variant="outline" disabled={createSubtask.isPending}>
          <Plus className="size-4" />
        </Button>
      </form>
    </div>
  );
}
