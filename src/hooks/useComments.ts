"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import * as commentService from "@/services/comment.service";
import { CreateCommentInput } from "@/types/comment";

export function useComments(taskId: string) {
  return useQuery({
    queryKey: queryKeys.comments(taskId),
    queryFn: () => commentService.listComments(taskId),
    enabled: !!taskId,
  });
}

function useInvalidateComments(taskId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.comments(taskId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.task(taskId) });
  };
}

export function useCreateComment(taskId: string) {
  const invalidate = useInvalidateComments(taskId);
  return useMutation({
    mutationFn: (input: CreateCommentInput) => commentService.createComment(taskId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateComment(taskId: string) {
  const invalidate = useInvalidateComments(taskId);
  return useMutation({
    mutationFn: ({ commentId, message }: { commentId: string; message: string }) =>
      commentService.updateComment(commentId, message),
    onSuccess: invalidate,
  });
}

export function useDeleteComment(taskId: string) {
  const invalidate = useInvalidateComments(taskId);
  return useMutation({
    mutationFn: (commentId: string) => commentService.deleteComment(commentId),
    onSuccess: invalidate,
  });
}
