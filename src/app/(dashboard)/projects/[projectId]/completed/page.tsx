"use client";

import { use, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TaskCard } from "@/components/board/TaskCard";
import { TaskDetailSheet } from "@/components/task/TaskDetailSheet";
import { Input } from "@/components/ui/input";
import { useLabels } from "@/hooks/useLabels";
import { useProject } from "@/hooks/useProject";
import { useTasks } from "@/hooks/useTasks";
import { useUsers } from "@/hooks/useUsers";

export default function ProjectCompletedPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { data: project } = useProject(projectId);
  const { data: tasks, isLoading } = useTasks(projectId, { completed: true });
  const { data: labels } = useLabels(projectId);
  const { data: users } = useUsers();
  const [search, setSearch] = useState("");
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const members = (users ?? []).filter((user) => project?.memberIds.includes(user.id));
  const visibleTasks = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return (tasks ?? []).filter(
      (task) => !term || task.title.toLocaleLowerCase().includes(term) || task.description.toLocaleLowerCase().includes(term)
    );
  }, [search, tasks]);

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="catalyst-page h-full max-w-6xl overflow-y-auto">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="catalyst-eyebrow">Project history</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight">Every completed task</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {visibleTasks.length} task{visibleTasks.length === 1 ? "" : "s"} shown
        </p>
      </div>

      <div className="catalyst-panel flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
            placeholder="Search completed tasks"
            aria-label="Search completed tasks"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : visibleTasks.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleTasks.map((task) => (
            <TaskCard key={task._id} task={task} projectKey={project.key} labels={labels ?? []} assignees={members} onClick={() => setOpenTaskId(task._id)} />
          ))}
        </div>
      ) : (
        <div className="catalyst-panel py-14 text-center">
          <p className="font-medium">No completed tasks yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">Finished tasks will show up here.</p>
        </div>
      )}

      <TaskDetailSheet
        taskId={openTaskId}
        projectId={project._id}
        projectKey={project.key}
        memberIds={project.memberIds}
        onOpenChange={(open) => !open && setOpenTaskId(null)}
        onOpenTask={setOpenTaskId}
      />
    </div>
  );
}
