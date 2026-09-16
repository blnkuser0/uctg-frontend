"use client";

import { use, useState } from "react";
import { CompletionGauge } from "@/components/reports/CompletionGauge";
import { OverdueList } from "@/components/reports/OverdueList";
import { WorkloadByAssignee } from "@/components/reports/WorkloadByAssignee";
import { TaskDetailSheet } from "@/components/task/TaskDetailSheet";
import { useProject } from "@/hooks/useProject";
import { useProjectReport } from "@/hooks/useProjectReport";
import { useUsers } from "@/hooks/useUsers";

export default function ProjectReportsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { data: project } = useProject(projectId);
  const { data: report, isLoading } = useProjectReport(projectId);
  const { data: users } = useUsers();
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  if (isLoading || !report || !project) {
    return (
      <div className="flex justify-center py-10">
        <div className="size-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="catalyst-page overflow-y-auto">
      <CompletionGauge
        totalTasks={report.totalTasks}
        completedTasks={report.completedTasks}
        completionPercent={report.completionPercent}
        byStage={report.byStage}
      />
      <OverdueList
        overdueTasks={report.overdueTasks}
        projectKey={project.key}
        users={users ?? []}
        onTaskClick={setOpenTaskId}
      />
      <WorkloadByAssignee workload={report.workload} users={users ?? []} />

      <TaskDetailSheet
        taskId={openTaskId}
        projectId={project._id}
        projectKey={project.key}
        memberIds={project.memberIds}
        onOpenChange={(open) => !open && setOpenTaskId(null)}
      />
    </div>
  );
}
