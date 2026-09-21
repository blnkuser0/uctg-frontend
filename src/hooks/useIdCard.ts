"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import * as idCardService from "@/services/idCard.service";

export function useMyIdCard() {
  return useQuery({ queryKey: queryKeys.idCard("me"), queryFn: idCardService.getMyIdCard });
}

export function useUserIdCard(userId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.idCard(userId),
    queryFn: () => idCardService.getUserIdCard(userId),
    enabled,
  });
}
