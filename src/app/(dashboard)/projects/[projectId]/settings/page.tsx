"use client";

import { use, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProject } from "@/hooks/useProject";
import { useStages, useUpdateStage, useDeleteStage, useCreateStage } from "@/hooks/useStages";
import { useLabels, useCreateLabel, useDeleteLabel } from "@/hooks/useLabels";
import { useAddProjectMember, useRemoveProjectMember } from "@/hooks/useProject";
import { useUsers } from "@/hooks/useUsers";
import { Trash2, Plus } from "lucide-react";

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function ProjectSettingsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { data: project } = useProject(projectId);
  const { data: stages } = useStages(projectId);
  const { data: labels } = useLabels(projectId);
  const { data: users } = useUsers();

  const createStage = useCreateStage(projectId);
  const updateStage = useUpdateStage(projectId);
  const deleteStage = useDeleteStage(projectId);
  const createLabel = useCreateLabel(projectId);
  const deleteLabel = useDeleteLabel(projectId);
  const addMember = useAddProjectMember(projectId);
  const removeMember = useRemoveProjectMember(projectId);

  const [newStageName, setNewStageName] = useState("");
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#f59e0b");
  const [addMemberId, setAddMemberId] = useState("");

  if (!project) return null;

  const members = (users ?? []).filter((u) => project.memberIds.includes(u.id));
  const nonMembers = (users ?? []).filter((u) => !project.memberIds.includes(u.id));

  function handleAddStage(e: React.FormEvent) {
    e.preventDefault();
    if (!newStageName.trim()) return;
    createStage.mutate({ name: newStageName.trim() }, { onSuccess: () => setNewStageName("") });
  }

  function handleDeleteStage(stageId: string) {
    const fallback = stages?.find((s) => s._id !== stageId)?._id;
    deleteStage.mutate(
      { stageId, reassignToStageId: fallback },
      { onError: () => toast.error("Could not delete this stage — it may still have tasks.") }
    );
  }

  function handleAddLabel(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabelName.trim()) return;
    createLabel.mutate(
      { name: newLabelName.trim(), color: newLabelColor },
      {
        onSuccess: () => setNewLabelName(""),
        onError: () => toast.error("A label with this name may already exist."),
      }
    );
  }

  function handleAddMember() {
    if (!addMemberId) return;
    addMember.mutate(addMemberId, { onSuccess: () => setAddMemberId("") });
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 overflow-y-auto p-4 md:p-8">
      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Stages</h2>
        <div className="mt-3 grid gap-2">
          {stages?.map((stage) => (
            <div key={stage._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-2">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                <span className="text-sm">{stage.name}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">WIP limit</span>
                  <Input
                    type="number"
                    min={1}
                    placeholder="None"
                    defaultValue={stage.wipLimit ?? ""}
                    onBlur={(e) => {
                      const raw = e.target.value.trim();
                      const wipLimit = raw === "" ? null : Math.max(1, parseInt(raw, 10));
                      if (wipLimit !== stage.wipLimit) {
                        updateStage.mutate({ stageId: stage._id, input: { wipLimit } });
                      }
                    }}
                    className="h-8 w-16 text-center"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Done stage</span>
                  <Switch
                    checked={stage.isDoneStage}
                    onCheckedChange={(checked) => updateStage.mutate({ stageId: stage._id, input: { isDoneStage: checked } })}
                  />
                </div>
                <Button size="icon-sm" variant="ghost" onClick={() => handleDeleteStage(stage._id)} aria-label="Delete stage">
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddStage} className="mt-3 flex gap-2">
          <Input placeholder="New stage name" value={newStageName} onChange={(e) => setNewStageName(e.target.value)} />
          <Button type="submit" size="sm" variant="outline">
            <Plus className="size-4" />
            Add
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Labels</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {labels?.map((label) => (
            <div key={label._id} className="flex items-center gap-1.5 rounded-full border border-border py-1 pl-3 pr-1.5">
              <span className="text-xs" style={{ color: label.color }}>
                {label.name}
              </span>
              <button
                onClick={() => deleteLabel.mutate(label._id)}
                aria-label="Delete label"
                className="rounded-full p-0.5 text-muted-foreground hover:bg-muted"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddLabel} className="mt-3 flex gap-2">
          <Input placeholder="Label name" value={newLabelName} onChange={(e) => setNewLabelName(e.target.value)} />
          <input
            type="color"
            value={newLabelColor}
            onChange={(e) => setNewLabelColor(e.target.value)}
            className="h-9 w-10 shrink-0 cursor-pointer rounded-md border border-border"
          />
          <Button type="submit" size="sm" variant="outline">
            <Plus className="size-4" />
            Add
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Members</h2>
        <div className="mt-3 grid gap-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between rounded-lg border border-border p-2">
              <div className="flex items-center gap-2">
                <Avatar className="size-6">
                  <AvatarFallback className="bg-amber-500/20 text-[10px] text-amber-700">{initials(member.name)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{member.name}</span>
                <Badge className="bg-muted font-normal text-muted-foreground">{member.role.name}</Badge>
              </div>
              {members.length > 1 && (
                <Button size="icon-sm" variant="ghost" onClick={() => removeMember.mutate(member.id)} aria-label="Remove member">
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
        {nonMembers.length > 0 && (
          <div className="mt-3 flex gap-2">
            <Select value={addMemberId} onValueChange={(value) => setAddMemberId(value ?? "")}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Add a teammate..." />
              </SelectTrigger>
              <SelectContent>
                {nonMembers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={handleAddMember} disabled={!addMemberId}>
              <Plus className="size-4" />
              Add
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
