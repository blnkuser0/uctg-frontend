export interface ProjectReportOverdueTask {
  _id: string;
  title: string;
  taskNumber: number;
  deadline: string;
  assigneeIds: string[];
}

export interface ProjectReportStageCount {
  stageId: string;
  name: string;
  count: number;
}

export interface ProjectReportWorkload {
  userId: string;
  assigned: number;
  completed: number;
}

export interface ProjectReport {
  projectId: string;
  totalTasks: number;
  completedTasks: number;
  completionPercent: number;
  overdueTasks: ProjectReportOverdueTask[];
  byStage: ProjectReportStageCount[];
  workload: ProjectReportWorkload[];
}
