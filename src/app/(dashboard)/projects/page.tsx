"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, FolderKanban, Sparkles } from "lucide-react";
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
    <div className="catalyst-page">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="catalyst-eyebrow">Delivery system</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Projects in motion</h1>
          <p className="mt-1 text-sm text-muted-foreground">The workspaces carrying your team&apos;s next milestones.</p>
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

      <section className="grid gap-3 md:grid-cols-[1.6fr_1fr]">
        <div className="catalyst-panel relative overflow-hidden p-5 sm:p-6">
          <div className="absolute -right-12 -top-12 size-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="catalyst-eyebrow">Workspace overview</p>
              <p className="mt-3 text-3xl font-bold tracking-tight">{projects?.length ?? 0}</p>
              <p className="mt-1 text-sm text-muted-foreground">active project {projects?.length === 1 ? "space" : "spaces"} in your view</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25"><FolderKanban className="size-5" /></div>
          </div>
        </div>
        <div className="catalyst-panel flex items-center gap-4 p-5 sm:p-6">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_oklch,var(--chart-2)_16%,transparent)] text-[var(--chart-2)]"><Sparkles className="size-4" /></div>
          <p className="text-sm leading-relaxed text-muted-foreground">Open a board to focus on the next concrete move, not just the backlog.</p>
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="size-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project._id}
              href={`/projects/${project._id}/board`}
              className="group catalyst-panel relative overflow-hidden p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/8"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="flex size-10 items-center justify-center rounded-xl text-xs font-bold text-slate-950 shadow-sm"
                  style={{ backgroundColor: project.color }}
                >
                  {project.key.slice(0, 2)}
                </span>
                <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <div className="mt-4">
                <p className="text-base font-semibold tracking-tight">{project.name}</p>
                <p className="mt-1 font-mono text-[11px] font-medium tracking-wide text-primary">{project.key}</p>
              </div>
              {project.description && (
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
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
