"use client";

import { AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { ProjectReportOverdueTask } from "@/types/report";
import { User } from "@/types/user";

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function OverdueList({
  overdueTasks,
  projectKey,
  users,
  onTaskClick,
}: {
  overdueTasks: ProjectReportOverdueTask[];
  projectKey: string;
  users: User[];
  onTaskClick: (taskId: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold">
        <AlertTriangle className="size-4 text-destructive" />
        Overdue ({overdueTasks.length})
      </h2>

      {overdueTasks.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">Nothing overdue — nice work.</p>
      ) : (
        <div className="mt-3 grid gap-1.5">
          {overdueTasks.map((task) => {
            const assignees = users.filter((u) => task.assigneeIds.includes(u.id));
            return (
              <button
                key={task._id}
                onClick={() => onTaskClick(task._id)}
                className="flex items-center justify-between gap-2 rounded-lg border border-border p-2 text-left hover:bg-muted"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{task.title}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {projectKey}-{task.taskNumber} · due {formatDate(task.deadline)}
                  </p>
                </div>
                <div className="flex -space-x-1.5">
                  {assignees.slice(0, 3).map((u) => (
                    <Avatar key={u.id} className="size-5 border border-background">
                      <AvatarFallback className="bg-destructive/15 text-[9px] text-destructive">
                        {initials(u.name)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
