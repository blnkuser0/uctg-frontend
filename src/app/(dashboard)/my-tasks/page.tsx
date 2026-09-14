"use client";

import { useState } from "react";
import { TaskCard } from "@/components/board/TaskCard";
import { TaskDetailSheet } from "@/components/task/TaskDetailSheet";
import { useMyTasks } from "@/hooks/useMyTasks";
import { useMyProjects } from "@/hooks/useProjects";
import { useUsers } from "@/hooks/useUsers";

export default function MyTasksPage() {
  const { data: tasks, isLoading } = useMyTasks();
  const { data: projects } = useMyProjects();
  const { data: users } = useUsers();
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const projectById = new Map((projects ?? []).map((p) => [p._id, p]));
  const openTask = (tasks ?? []).find((t) => t._id === openTaskId) ?? null;
  const openProject = openTask ? projectById.get(openTask.projectId) : null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4 md:p-8">
      <div>
        <h1 className="text-lg font-semibold">My Tasks</h1>
        <p className="text-sm text-muted-foreground">Everything assigned to you, across every project.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="size-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
      ) : tasks && tasks.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {tasks.map((task) => {
            const project = projectById.get(task.projectId);
            return (
              <TaskCard
                key={task._id}
                task={task}
                projectKey={project?.key ?? "?"}
                labels={[]}
                assignees={users ?? []}
                onClick={() => setOpenTaskId(task._id)}
              />
            );
          })}
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-muted-foreground">Nothing assigned to you right now.</p>
      )}

      {openProject && (
        <TaskDetailSheet
          taskId={openTaskId}
          projectId={openProject._id}
          projectKey={openProject.key}
          memberIds={openProject.memberIds}
          onOpenChange={(open) => !open && setOpenTaskId(null)}
        />
      )}
    </div>
  );
}
