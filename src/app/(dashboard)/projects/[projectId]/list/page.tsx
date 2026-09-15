"use client";

import { use, useMemo, useState } from "react";
import { ListFilter, Search } from "lucide-react";
import { TaskCard } from "@/components/board/TaskCard";
import { TaskDetailSheet } from "@/components/task/TaskDetailSheet";
import { Input } from "@/components/ui/input";
import { useLabels } from "@/hooks/useLabels";
import { useProject } from "@/hooks/useProject";
import { useStages } from "@/hooks/useStages";
import { useTasks } from "@/hooks/useTasks";
import { useUsers } from "@/hooks/useUsers";

export default function ProjectListPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { data: project } = useProject(projectId);
  const { data: tasks, isLoading } = useTasks(projectId);
  const { data: stages } = useStages(projectId);
  const { data: labels } = useLabels(projectId);
  const { data: users } = useUsers();
  const [search, setSearch] = useState("");
  const [stageId, setStageId] = useState("all");
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const members = (users ?? []).filter((user) => project?.memberIds.includes(user.id));
  const visibleTasks = useMemo(
    () => (tasks ?? []).filter((task) => {
      const term = search.trim().toLocaleLowerCase();
      return (stageId === "all" || task.stageId === stageId) && (!term || task.title.toLocaleLowerCase().includes(term) || task.description.toLocaleLowerCase().includes(term));
    }),
    [search, stageId, tasks]
  );

  if (!project) {
    return <div className="flex h-full items-center justify-center"><div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="catalyst-page h-full max-w-6xl overflow-y-auto">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="catalyst-eyebrow">Project inventory</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight">Every task, one focused view</h2>
        </div>
        <p className="text-sm text-muted-foreground">{visibleTasks.length} task{visibleTasks.length === 1 ? "" : "s"} shown</p>
      </div>

      <div className="catalyst-panel flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Search tasks and descriptions" aria-label="Search tasks" />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <ListFilter className="size-4" />
          <select value={stageId} onChange={(event) => setStageId(event.target.value)} className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="all">All stages</option>
            {(stages ?? []).map((stage) => <option key={stage._id} value={stage._id}>{stage.name}</option>)}
          </select>
        </label>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
      ) : visibleTasks.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleTasks.map((task) => <TaskCard key={task._id} task={task} projectKey={project.key} labels={labels ?? []} assignees={members} onClick={() => setOpenTaskId(task._id)} />)}
        </div>
      ) : (
        <div className="catalyst-panel py-14 text-center"><p className="font-medium">No tasks match this view.</p><p className="mt-1 text-sm text-muted-foreground">Try another stage or clear your search.</p></div>
      )}

      <TaskDetailSheet taskId={openTaskId} projectId={project._id} projectKey={project.key} memberIds={project.memberIds} onOpenChange={(open) => !open && setOpenTaskId(null)} onOpenTask={setOpenTaskId} />
    </div>
  );
}
