"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateProject } from "@/hooks/useProjects";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createProject = useCreateProject();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    createProject.mutate(
      { name: name.trim(), description: description.trim() || undefined },
      {
        onSuccess: (project) => {
          toast.success("Project created");
          setOpen(false);
          setName("");
          setDescription("");
          router.push(`/projects/${project._id}/board`);
        },
        onError: () => toast.error("Could not create the project."),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-cyan-600 text-white hover:bg-cyan-500">
            <Plus className="size-4" />
            New Project
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a project</DialogTitle>
          <DialogDescription>Every project starts with default stages: Design, Procurement, Installation, QA, Done.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1.5">
            <Label htmlFor="projectName">Project name</Label>
            <Input id="projectName" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Downtown Office Fitout" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="projectDescription">Description (optional)</Label>
            <Textarea id="projectDescription" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createProject.isPending} className="bg-cyan-600 text-white hover:bg-cyan-500">
              {createProject.isPending ? "Creating..." : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
