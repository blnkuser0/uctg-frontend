"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectSocket } from "@/lib/socket-client";
import { queryKeys } from "@/lib/queryKeys";
import { Task } from "@/types/task";

/**
 * Joins the project's socket room and reconciles the React Query cache on
 * every `pm:*` event: structural changes (stage/label/project) trigger a
 * refetch, task list changes are patched into the cached list directly so
 * drag moves from other viewers feel instant. Events scoped to a single
 * open task (checklist/comments/timer) just invalidate that task's own
 * queries — simpler than patching, and that view is rarely open on two
 * screens at once anyway.
 */
export function useProjectSocket(projectId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) return;
    const socket = connectSocket();
    socket.emit("project:subscribe", projectId);

    const tasksKeyPrefix = ["projects", projectId, "tasks"];

    const invalidateProject = () => queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) });
    const invalidateStages = () => queryClient.invalidateQueries({ queryKey: queryKeys.stages(projectId) });
    const invalidateLabels = () => queryClient.invalidateQueries({ queryKey: queryKeys.labels(projectId) });
    const invalidateTasks = () => queryClient.invalidateQueries({ queryKey: tasksKeyPrefix });

    function patchTask({ task }: { task: Task }) {
      queryClient.setQueriesData<Task[]>({ queryKey: tasksKeyPrefix }, (old) => {
        if (!old) return old;
        const exists = old.some((t) => t._id === task._id);
        return exists ? old.map((t) => (t._id === task._id ? task : t)) : [...old, task];
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.task(task._id) });
    }

    function removeTask({ taskId }: { taskId: string }) {
      queryClient.setQueriesData<Task[]>({ queryKey: tasksKeyPrefix }, (old) =>
        old ? old.filter((t) => t._id !== taskId) : old
      );
    }

    function onStageDeleted() {
      // Tasks may have been reassigned to another stage server-side.
      invalidateStages();
      invalidateTasks();
    }

    function onChecklistUpdated({ taskId }: { taskId: string }) {
      queryClient.invalidateQueries({ queryKey: queryKeys.task(taskId) });
      invalidateTasks();
    }

    function onCommentEvent({ taskId }: { taskId: string }) {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.task(taskId) });
    }

    function onTimerEvent({ taskId }: { taskId: string }) {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries(taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.task(taskId) });
    }

    socket.on("pm:project:updated", invalidateProject);
    socket.on("pm:project:deleted", invalidateProject);
    socket.on("pm:stage:created", invalidateStages);
    socket.on("pm:stage:updated", invalidateStages);
    socket.on("pm:stage:reordered", invalidateStages);
    socket.on("pm:stage:deleted", onStageDeleted);
    socket.on("pm:label:created", invalidateLabels);
    socket.on("pm:label:updated", invalidateLabels);
    socket.on("pm:label:deleted", invalidateLabels);
    socket.on("pm:task:created", patchTask);
    socket.on("pm:task:updated", patchTask);
    socket.on("pm:task:moved", patchTask);
    socket.on("pm:task:deleted", removeTask);
    socket.on("pm:task:checklist:updated", onChecklistUpdated);
    socket.on("pm:comment:created", onCommentEvent);
    socket.on("pm:comment:updated", onCommentEvent);
    socket.on("pm:comment:deleted", onCommentEvent);
    socket.on("pm:timer:started", onTimerEvent);
    socket.on("pm:timer:stopped", onTimerEvent);

    return () => {
      socket.emit("project:unsubscribe", projectId);
      socket.off("pm:project:updated", invalidateProject);
      socket.off("pm:project:deleted", invalidateProject);
      socket.off("pm:stage:created", invalidateStages);
      socket.off("pm:stage:updated", invalidateStages);
      socket.off("pm:stage:reordered", invalidateStages);
      socket.off("pm:stage:deleted", onStageDeleted);
      socket.off("pm:label:created", invalidateLabels);
      socket.off("pm:label:updated", invalidateLabels);
      socket.off("pm:label:deleted", invalidateLabels);
      socket.off("pm:task:created", patchTask);
      socket.off("pm:task:updated", patchTask);
      socket.off("pm:task:moved", patchTask);
      socket.off("pm:task:deleted", removeTask);
      socket.off("pm:task:checklist:updated", onChecklistUpdated);
      socket.off("pm:comment:created", onCommentEvent);
      socket.off("pm:comment:updated", onCommentEvent);
      socket.off("pm:comment:deleted", onCommentEvent);
      socket.off("pm:timer:started", onTimerEvent);
      socket.off("pm:timer:stopped", onTimerEvent);
    };
  }, [projectId, queryClient]);
}
