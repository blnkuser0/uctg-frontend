"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateStage } from "@/hooks/useStages";

export function NewStageButton({ projectId }: { projectId: string }) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const createStage = useCreateStage(projectId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createStage.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          setName("");
          setIsAdding(false);
        },
        onError: () => toast.error("Could not create the stage."),
      }
    );
  }

  if (!isAdding) {
    return (
      <Button variant="outline" className="h-fit w-72 shrink-0 justify-start" onClick={() => setIsAdding(true)}>
        <Plus className="size-4" />
        Add stage
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-72 shrink-0 flex-col gap-2 rounded-2xl border border-border bg-card p-3">
      <Input
        autoFocus
        placeholder="Stage name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => !name && setIsAdding(false)}
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={createStage.isPending} className="bg-cyan-600 text-white hover:bg-cyan-500">
          Add
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
