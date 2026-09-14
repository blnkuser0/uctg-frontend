"use client";

import { Progress } from "@/components/ui/progress";
import { ProjectReportStageCount } from "@/types/report";

export function CompletionGauge({
  totalTasks,
  completedTasks,
  completionPercent,
  byStage,
}: {
  totalTasks: number;
  completedTasks: number;
  completionPercent: number;
  byStage: ProjectReportStageCount[];
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">Completion</h2>
      <div className="mt-3 flex items-end gap-3">
        <span className="text-3xl font-semibold">{completionPercent}%</span>
        <span className="pb-1 text-xs text-muted-foreground">
          {completedTasks} of {totalTasks} tasks done
        </span>
      </div>
      <Progress value={completionPercent} className="mt-2 h-2" />

      {byStage.length > 0 && (
        <div className="mt-4 grid gap-1.5">
          {byStage.map((stage) => (
            <div key={stage.stageId} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{stage.name}</span>
              <span className="font-medium">{stage.count}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
