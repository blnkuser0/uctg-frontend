"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Layers3, Plus, Search, UsersRound } from "lucide-react";
import { useAllProjects, useMyProjects } from "@/hooks/useProjects";
import { NewProjectDialog } from "@/components/board/NewProjectDialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/providers/AuthProvider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/layout/PageHeader";
import { PERMISSIONS } from "@/types/role";

export default function ProjectsPage() {
  const { user } = useAuth();
  const canManageAll = user?.role.permissions.includes(PERMISSIONS.PROJECTS_MANAGE) ?? false;
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"recent" | "name" | "team">("recent");
  const myProjects = useMyProjects();
  const allProjects = useAllProjects(canManageAll && scope === "all");
  const { data: projects, isLoading } = scope === "all" ? allProjects : myProjects;
  const visibleProjects = [...(projects ?? [])]
    .filter((project) => `${project.name} ${project.key} ${project.description}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((first, second) => sort === "name" ? first.name.localeCompare(second.name) : sort === "team" ? second.memberIds.length - first.memberIds.length : new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime());

  return (
    <div className="catalyst-page max-w-[90rem]">
      <PageHeader title="Projects" section="Workspace / Client delivery" actions={<>{canManageAll && <Tabs value={scope} onValueChange={(value) => setScope(value as "mine" | "all")}><TabsList className="rounded-none border border-border bg-background p-0"><TabsTrigger className="rounded-none px-3" value="mine">Assigned to me</TabsTrigger><TabsTrigger className="rounded-none px-3" value="all">All client work</TabsTrigger></TabsList></Tabs>}<NewProjectDialog /></>} />

      <section className="grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
        <div className="bg-card p-5"><p className="font-mono text-[10px] tracking-[.14em] text-muted-foreground uppercase">Visible projects</p><p className="mt-4 text-4xl font-semibold tracking-[-.05em]">{isLoading ? "—" : String(visibleProjects.length).padStart(2, "0")}</p></div>
        <div className="bg-card p-5"><p className="font-mono text-[10px] tracking-[.14em] text-muted-foreground uppercase">Assignment rule</p><p className="mt-4 text-sm font-medium leading-6">Umbrella developers connect to clients through a project.</p></div>
        <div className="bg-card p-5"><p className="font-mono text-[10px] tracking-[.14em] text-muted-foreground uppercase">Workspace state</p><div className="mt-4 flex items-center gap-2 text-sm font-medium"><span className="size-2 bg-emerald-500" /> Ready for delivery</div></div>
      </section>

      <div className="flex flex-col gap-2 border border-border bg-card p-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter projects by name, key, or brief..." className="h-9 border-0 bg-transparent pl-9 shadow-none" /></div>
        <Select value={sort} items={{ recent: "Recently updated", name: "Project name", team: "Largest team" }} onValueChange={(value) => setSort(value as typeof sort)}><SelectTrigger className="h-9 w-full sm:w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="recent">Recently updated</SelectItem><SelectItem value="name">Project name</SelectItem><SelectItem value="team">Largest team</SelectItem></SelectContent></Select>
      </div>

      {isLoading ? <ProjectGridSkeleton /> : visibleProjects.length > 0 ? <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{visibleProjects.map((project, index) => <Link key={project._id} href={`/projects/${project._id}/board`} className="group relative min-h-56 overflow-hidden border border-border bg-card p-5 transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-primary/70 hover:shadow-[0_18px_38px_-28px_color-mix(in_oklch,var(--primary)_72%,transparent)]"><div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-primary transition-transform duration-200 group-hover:scale-x-100" /><div className="flex items-start justify-between gap-4"><span className="font-mono text-[10px] tracking-[.16em] text-muted-foreground">{String(index + 1).padStart(2, "0")}</span><ArrowUpRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" /></div><div className="mt-8 flex size-11 items-center justify-center border border-black/10 text-xs font-bold text-slate-950 dark:border-white/10" style={{ backgroundColor: project.color }}>{project.key.slice(0, 2)}</div><div className="mt-5"><p className="text-lg font-semibold tracking-[-.025em]">{project.name}</p><p className="mt-1 font-mono text-[11px] tracking-[.12em] text-primary">{project.key}</p></div><p className="mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground">{project.description || "No project brief has been added yet."}</p><div className="mt-5 flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground"><UsersRound className="size-3.5" /> {project.memberIds.length} assigned {project.memberIds.length === 1 ? "member" : "members"}</div></Link>)}</section> : <EmptyProjects />}
    </div>
  );
}

function ProjectGridSkeleton() { return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-56 animate-pulse border border-border bg-card" />)}</div>; }

function EmptyProjects() { return <section className="border border-dashed border-border bg-card/60 p-8 sm:p-12"><Layers3 className="size-5 text-primary" /><h2 className="mt-6 text-xl font-semibold tracking-[-.03em]">No project assignment yet.</h2><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Create your first project, or wait for a Super Admin to assign you to one.</p><div className="mt-6"><NewProjectDialog trigger={<span><Plus className="size-4" /> Create project</span>} /></div></section>; }
