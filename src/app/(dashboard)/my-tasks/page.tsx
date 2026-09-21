"use client";

import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { CheckCircle2, Grid2X2, List, Search, SlidersHorizontal } from "lucide-react";
import { TaskCard } from "@/components/board/TaskCard";
import { TaskDetailSheet } from "@/components/task/TaskDetailSheet";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useMyTasks } from "@/hooks/useMyTasks";
import { useMyProjects } from "@/hooks/useProjects";
import { useUsers } from "@/hooks/useUsers";
import { queryKeys } from "@/lib/queryKeys";
import { listStages } from "@/services/stage.service";
import { Task } from "@/types/task";

type ViewMode = "grid" | "list";
type DueFilter = "all" | "overdue" | "week" | "none";

export default function MyTasksPage() {
  const { data: tasks, isLoading } = useMyTasks();
  const { data: projects } = useMyProjects();
  const { data: users } = useUsers();
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [projectId, setProjectId] = useState("all");
  const [stageId, setStageId] = useState("all");
  const [priority, setPriority] = useState("all");
  const [due, setDue] = useState<DueFilter>("all");
  const [view, setView] = useState<ViewMode>("grid");

  const projectList = projects ?? [];
  const stageQueries = useQueries({
    queries: projectList.map((project) => ({
      queryKey: queryKeys.stages(project._id),
      queryFn: () => listStages(project._id),
      staleTime: 60_000,
    })),
  });
  const stages = stageQueries.flatMap((result) => result.data ?? []);
  const stageById = new Map(stages.map((stage) => [stage._id, stage]));
  const projectById = new Map(projectList.map((project) => [project._id, project]));
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const visibleTasks = useMemo(() => (tasks ?? []).filter((task) => {
    const needle = query.trim().toLowerCase();
    const project = projectById.get(task.projectId);
    const matchesQuery = !needle || `${task.title} ${task.description} ${project?.name ?? ""} ${project?.key ?? ""}`.toLowerCase().includes(needle);
    const deadline = task.deadline ? new Date(task.deadline) : null;
    const matchesDue = due === "all"
      || (due === "overdue" && deadline && deadline < now && !task.completedAt)
      || (due === "week" && deadline && deadline >= now && deadline <= nextWeek)
      || (due === "none" && !deadline);
    return matchesQuery
      && (projectId === "all" || task.projectId === projectId)
      && (stageId === "all" || task.stageId === stageId)
      && (priority === "all" || task.priority === priority)
      && !!matchesDue;
  }), [due, nextWeek, now, priority, projectById, projectId, query, stageId, tasks]);

  const openTask = (tasks ?? []).find((task) => task._id === openTaskId) ?? null;
  const openProject = openTask ? projectById.get(openTask.projectId) : null;
  const overdueCount = (tasks ?? []).filter((task) => task.deadline && new Date(task.deadline) < now && !task.completedAt).length;
  const completedCount = (tasks ?? []).filter((task) => !!task.completedAt).length;
  const highCount = (tasks ?? []).filter((task) => task.priority === "urgent" || task.priority === "high").length;

  function clearFilters() {
    setQuery("");
    setProjectId("all");
    setStageId("all");
    setPriority("all");
    setDue("all");
  }

  return (
    <div className="catalyst-page max-w-[90rem]">
      <PageHeader title="My Tasks" section="Workspace / Personal queue" tone="violet" actions={<span className="border border-violet-500/25 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300">{visibleTasks.length} visible</span>} />

      <section className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-3">
        <TaskMetric label="Assigned" value={(tasks ?? []).length} tone="border-t-sky-500" />
        <TaskMetric label="High attention" value={highCount} tone="border-t-amber-500" />
        <TaskMetric label="Completed" value={completedCount} tone="border-t-emerald-500" />
      </section>

      <section className="catalyst-panel overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3"><SlidersHorizontal className="size-4 text-violet-500" /><h2 className="text-sm font-semibold">Filter work queue</h2>{overdueCount > 0 && <span className="ml-auto text-[11px] font-medium text-destructive">{overdueCount} overdue</span>}</div>
        <div className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-[minmax(15rem,1fr)_repeat(4,minmax(8rem,.42fr))_auto]">
          <div className="relative min-w-0 sm:col-span-2 xl:col-span-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, description, project..." className="pl-9" /></div>
          <Select value={projectId} onValueChange={(value) => setProjectId(value ?? "all")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All projects</SelectItem>{projectList.map((project) => <SelectItem key={project._id} value={project._id}>{project.key} · {project.name}</SelectItem>)}</SelectContent></Select>
          <Select value={stageId} onValueChange={(value) => setStageId(value ?? "all")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{stages.map((stage) => <SelectItem key={stage._id} value={stage._id}>{stage.name}</SelectItem>)}</SelectContent></Select>
          <Select value={priority} onValueChange={(value) => setPriority(value ?? "all")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All priorities</SelectItem><SelectItem value="urgent">Urgent</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="normal">Normal</SelectItem><SelectItem value="low">Low</SelectItem></SelectContent></Select>
          <Select value={due} onValueChange={(value) => setDue((value ?? "all") as DueFilter)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Any deadline</SelectItem><SelectItem value="overdue">Overdue</SelectItem><SelectItem value="week">Due this week</SelectItem><SelectItem value="none">No deadline</SelectItem></SelectContent></Select>
          <div className="flex border border-border"><Button type="button" variant={view === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setView("grid")} aria-label="Grid view"><Grid2X2 className="size-3.5" /></Button><Button type="button" variant={view === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setView("list")} aria-label="List view"><List className="size-3.5" /></Button></div>
        </div>
      </section>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-44 animate-pulse border border-border bg-card" />)}</div>
      ) : visibleTasks.length > 0 ? view === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleTasks.map((task) => <TaskCard key={task._id} task={task} projectKey={projectById.get(task.projectId)?.key ?? "TASK"} labels={[]} assignees={users ?? []} statusLabel={stageById.get(task.stageId)?.name ?? "Status"} onClick={() => setOpenTaskId(task._id)} />)}
        </div>
      ) : (
        <div className="catalyst-panel overflow-hidden">
          <div className="grid grid-cols-[minmax(0,1fr)_6rem] border-b border-border bg-muted/35 px-4 py-2 text-[10px] font-medium text-muted-foreground md:grid-cols-[minmax(0,1fr)_8rem_8rem_7rem]"><span>Task</span><span>Status</span><span className="hidden md:block">Priority</span><span className="hidden md:block">Deadline</span></div>
          <div className="divide-y divide-border">{visibleTasks.map((task) => <TaskRow key={task._id} task={task} projectKey={projectById.get(task.projectId)?.key ?? "TASK"} status={stageById.get(task.stageId)?.name ?? "Status"} onOpen={() => setOpenTaskId(task._id)} />)}</div>
        </div>
      ) : (
        <section className="catalyst-panel border-dashed px-6 py-14 text-center"><CheckCircle2 className="mx-auto size-7 text-violet-500" /><h2 className="mt-4 text-lg font-bold">No tasks in this view</h2><p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{(tasks ?? []).length === 0 ? "Once you are assigned to client work, tasks and their live status will appear here." : "Your filters are hiding the current queue. Clear them to see all assigned work."}</p>{(tasks ?? []).length > 0 && <Button variant="outline" className="mt-5" onClick={clearFilters}>Clear all filters</Button>}</section>
      )}

      {openProject && <TaskDetailSheet taskId={openTaskId} projectId={openProject._id} projectKey={openProject.key} memberIds={openProject.memberIds} onOpenChange={(next) => !next && setOpenTaskId(null)} />}
    </div>
  );
}

function TaskMetric({ label, value, tone }: { label: string; value: number; tone: string }) {
  return <div className={`border-t-2 bg-card px-4 py-3 ${tone}`}><p className="text-[10px] font-medium text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold">{String(value).padStart(2, "0")}</p></div>;
}

function TaskRow({ task, projectKey, status, onOpen }: { task: Task; projectKey: string; status: string; onOpen: () => void }) {
  return <button type="button" onClick={onOpen} className="grid w-full grid-cols-[minmax(0,1fr)_6rem] items-center px-4 py-3 text-left transition-colors hover:bg-muted/40 md:grid-cols-[minmax(0,1fr)_8rem_8rem_7rem]"><span className="min-w-0"><span className="block truncate text-sm font-semibold">{task.title}</span><span className="mt-0.5 block text-[10px] text-muted-foreground">{projectKey}-{task.taskNumber} · {task.commentCount} comments · {task.attachments.length} files</span></span><span className="truncate text-xs text-violet-600 dark:text-violet-300">{status}</span><span className="hidden text-xs capitalize text-muted-foreground md:block">{task.priority ?? "normal"}</span><span className="hidden text-xs text-muted-foreground md:block">{task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "None"}</span></button>;
}
