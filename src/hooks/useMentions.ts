"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import * as mentionsService from "@/services/mentions.service";

export function useMentions() {
  return useQuery({ queryKey: queryKeys.mentions(), queryFn: mentionsService.listMentions });
}
