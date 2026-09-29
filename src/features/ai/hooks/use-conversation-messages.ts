"use client";

import { useQuery } from "@tanstack/react-query";
import { listConversationMessages } from "@/features/ai/api";
import { queryKeys } from "@/lib/query/query-keys";

export function useConversationMessages(
  workspaceId: string | null,
  conversationId: string | null,
) {
  return useQuery({
    queryKey: queryKeys.conversationMessages(
      workspaceId ?? "",
      conversationId ?? "",
    ),
    queryFn: () =>
      listConversationMessages(
        workspaceId as string,
        conversationId as string,
      ),
    enabled: Boolean(workspaceId && conversationId),
  });
}
