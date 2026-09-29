"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createConversation,
  listConversations,
  updateConversation,
} from "@/features/ai/api";
import type {
  CreateConversationRequest,
  UpdateConversationRequest,
} from "@/features/ai/types";
import { queryKeys } from "@/lib/query/query-keys";

export function useConversations(workspaceId: string | null) {
  return useQuery({
    queryKey: queryKeys.conversations(workspaceId ?? ""),
    queryFn: () => listConversations(workspaceId as string, { status: "ACTIVE" }),
    enabled: Boolean(workspaceId),
  });
}

export function useCreateConversation(workspaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateConversationRequest) =>
      createConversation(workspaceId as string, payload),
    gcTime: 0,
    onSuccess: async () => {
      if (!workspaceId) {
        return;
      }
      await queryClient.invalidateQueries({
        queryKey: queryKeys.conversations(workspaceId),
      });
    },
  });
}

export function useClearConversation(workspaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      payload,
    }: {
      conversationId: string;
      payload: UpdateConversationRequest;
    }) => updateConversation(workspaceId as string, conversationId, payload),
    gcTime: 0,
    onSuccess: async (_data, variables) => {
      if (!workspaceId) {
        return;
      }
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.conversations(workspaceId),
        }),
        queryClient.removeQueries({
          queryKey: queryKeys.conversationMessages(
            workspaceId,
            variables.conversationId,
          ),
        }),
      ]);
    },
  });
}
