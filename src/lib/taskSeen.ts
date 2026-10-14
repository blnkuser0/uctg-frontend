import { Task } from "@/types/task";

/** Whether `task` has an update the current user hasn't seen yet (Task.seenBy resets to just the
 *  actor on every meaningful change — see backend/src/services/task.service.ts). */
export function isTaskUnseen(task: Task, currentUserId: string | undefined): boolean {
  if (!currentUserId) return false;
  return !task.seenBy.includes(currentUserId);
}
