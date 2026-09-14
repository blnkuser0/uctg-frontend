"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAddChecklistItem, useUpdateChecklistItem, useDeleteChecklistItem } from "@/hooks/useTask";
import { Task } from "@/types/task";
import { Plus, X } from "lucide-react";

export function TaskChecklist({ task, projectId }: { task: Task; projectId: string }) {
  const [newItemText, setNewItemText] = useState("");
  const addItem = useAddChecklistItem(task._id, projectId);
  const updateItem = useUpdateChecklistItem(task._id, projectId);
  const deleteItem = useDeleteChecklistItem(task._id, projectId);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemText.trim()) return;
    addItem.mutate(newItemText.trim(), {
      onSuccess: () => setNewItemText(""),
      onError: () => toast.error("Could not add the item."),
    });
  }

  const sortedItems = [...task.checklist].sort((a, b) => a.order - b.order);

  return (
    <div className="grid gap-3">
      {task.checklist.length > 0 && (
        <div className="flex items-center gap-2">
          <Progress value={task.checklistProgress} className="h-1.5" />
          <span className="text-xs text-muted-foreground">{task.checklistProgress}%</span>
        </div>
      )}

      <div className="grid gap-1">
        {sortedItems.map((item) => (
          <div key={item._id} className="group flex items-center gap-2 rounded-md px-1 py-1 hover:bg-muted">
            <Checkbox
              checked={item.isChecked}
              onCheckedChange={(checked) => updateItem.mutate({ itemId: item._id, updates: { isChecked: checked === true } })}
            />
            <span className={item.isChecked ? "flex-1 text-sm text-muted-foreground line-through" : "flex-1 text-sm"}>
              {item.text}
            </span>
            <button
              onClick={() => deleteItem.mutate(item._id)}
              className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-muted-foreground hover:text-destructive"
              aria-label="Remove item"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          placeholder="Add a checklist item"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
        />
        <Button type="submit" size="sm" variant="outline" disabled={addItem.isPending}>
          <Plus className="size-4" />
        </Button>
      </form>
    </div>
  );
}
