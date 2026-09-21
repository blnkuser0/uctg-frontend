"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAssignDeveloper, usePlatformDevelopers, useUnassignDeveloper } from "@/hooks/usePlatform";
import { PlatformOrganization } from "@/types/platform";
import { Project } from "@/types/project";

export function ProjectOversightList({
  projects,
  organizations,
}: {
  projects: Project[];
  organizations: PlatformOrganization[];
}) {
  const { data: developers } = usePlatformDevelopers();
  const assign = useAssignDeveloper();
  const unassign = useUnassignDeveloper();
  const [pickerProjectId, setPickerProjectId] = useState<string | null>(null);
  const [selectedDevId, setSelectedDevId] = useState("");

  const orgNameById = new Map(organizations.map((o) => [o._id, o.name]));
  const devById = new Map((developers ?? []).map((d) => [d.id, d]));

  if (projects.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No projects yet.</p>;
  }

  function handleAssign(projectId: string) {
    if (!selectedDevId) return;
    assign.mutate(
      { projectId, userId: selectedDevId },
      {
        onSuccess: () => {
          toast.success("Developer assigned");
          setSelectedDevId("");
          setPickerProjectId(null);
        },
        onError: () => toast.error("Could not assign this developer."),
      }
    );
  }

  function handleUnassign(projectId: string, userId: string) {
    unassign.mutate(
      { projectId, userId },
      {
        onSuccess: () => toast.success("Developer unassigned"),
        onError: () => toast.error("Could not unassign this developer."),
      }
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {projects.map((project) => {
        const assignedDevIds = project.memberIds.filter((id) => devById.has(id));
        const availableDevs = (developers ?? []).filter((d) => !project.memberIds.includes(d.id));

        return (
          <div key={project._id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{ backgroundColor: project.color }}
              >
                {project.key.slice(0, 2)}
              </span>
              <div className="min-w-0">
                <h3 className="truncate font-semibold">{project.name}</h3>
                <p className="truncate text-xs text-muted-foreground">
                  {orgNameById.get(project.organizationId) ?? project.organizationId}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {assignedDevIds.length === 0 && (
                <span className="text-xs text-muted-foreground">No developers assigned</span>
              )}
              {assignedDevIds.map((id) => {
                const dev = devById.get(id);
                return (
                  <Badge key={id} className="gap-1 bg-cyan-500/15 font-normal text-cyan-700">
                    {dev?.name ?? id}
                    <button type="button" onClick={() => handleUnassign(project._id, id)} aria-label={`Unassign ${dev?.name ?? "developer"}`}>
                      <X className="size-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Select
                value={pickerProjectId === project._id ? selectedDevId || undefined : undefined}
                onValueChange={(v) => {
                  setPickerProjectId(project._id);
                  setSelectedDevId(v ?? "");
                }}
              >
                <SelectTrigger size="sm">
                  <SelectValue placeholder="Assign a developer..." />
                </SelectTrigger>
                <SelectContent>
                  {availableDevs.map((dev) => (
                    <SelectItem key={dev.id} value={dev.id}>
                      {dev.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                disabled={pickerProjectId !== project._id || !selectedDevId || assign.isPending}
                onClick={() => handleAssign(project._id)}
              >
                Assign
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
