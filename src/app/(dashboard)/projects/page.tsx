"use client";

import { useState } from "react";
import Link from "next/link";
import { useAllProjects, useMyProjects } from "@/hooks/useProjects";
import { NewProjectDialog } from "@/components/board/NewProjectDialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/providers/AuthProvider";
import { PERMISSIONS } from "@/types/role";

export default function ProjectsPage() {
  const { user } = useAuth();
  const canManageAll = user?.role.permissions.includes(PERMISSIONS.PROJECTS_MANAGE) ?? false;
  const [scope, setScope] = useState<"mine" | "all">("mine");

  const myProjects = useMyProjects();
  const allProjects = useAllProjects(canManageAll && scope === "all");
  const { data: projects, isLoading } = scope === "all" ? allProjects : myProjects;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">Your fitout projects and their boards.</p>
        </div>
        <div className="flex items-center gap-2">
          {canManageAll && (
            <Tabs value={scope} onValueChange={(v) => setScope(v as "mine" | "all")}>
              <TabsList>
                <TabsTrigger value="mine">My projects</TabsTrigger>
                <TabsTrigger value="all">All projects</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          <NewProjectDialog />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="size-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project._id}
              href={`/projects/${project._id}/board`}
              className="rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <span
                  className="flex size-8 items-center justify-center rounded-lg text-xs font-bold text-stone-900"
                  style={{ backgroundColor: project.color }}
                >
                  {project.key.slice(0, 2)}
                </span>
                <div>
                  <p className="text-sm font-semibold">{project.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{project.key}</p>
                </div>
              </div>
              {project.description && (
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{project.description}</p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No projects yet — create your first one to get started.
        </p>
      )}
    </div>
  );
}
