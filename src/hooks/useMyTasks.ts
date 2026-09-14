"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import * as myTasksService from "@/services/myTasks.service";

export function useMyTasks() {
  return useQuery({ queryKey: queryKeys.myTasks(), queryFn: myTasksService.listMyTasks });
}
