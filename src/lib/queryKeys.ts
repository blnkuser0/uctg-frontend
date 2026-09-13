export const queryKeys = {
  me: ["me"] as const,
  users: (q?: string) => ["users", q ?? ""] as const,
  projects: () => ["projects"] as const,
  project: (projectId: string) => ["projects", projectId] as const,
  stages: (projectId: string) => ["projects", projectId, "stages"] as const,
  labels: (projectId: string) => ["projects", projectId, "labels"] as const,
  tasks: (projectId: string, filters?: Record<string, string | undefined>) =>
    ["projects", projectId, "tasks", filters ?? {}] as const,
  task: (taskId: string) => ["tasks", taskId] as const,
  myTasks: () => ["my-tasks"] as const,
  mentions: () => ["mentions"] as const,
  notifications: () => ["notifications"] as const,
  notificationsCount: () => ["notifications", "count"] as const,
};
