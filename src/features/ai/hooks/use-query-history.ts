"use client";

import { useQuery } from "@tanstack/react-query";
import { getQueryHistory, listQueryHistory } from "@/features/ai/api";
import { queryKeys } from "@/lib/query/query-keys";

export function useQueryHistory(
  workspaceId: string | null,
  options?: { page?: number; pageSize?: number; status?: string; dataSourceId?: string },
) {
  return useQuery({
    queryKey: queryKeys.queryHistory(workspaceId ?? "", options),
    queryFn: () => listQueryHistory(workspaceId as string, options),
    enabled: Boolean(workspaceId),
  });
}

export function useQueryHistoryDetail(
  workspaceId: string | null,
  historyId: string | null,
) {
  return useQuery({
    queryKey: queryKeys.queryHistoryDetail(workspaceId ?? "", historyId ?? ""),
    queryFn: () => getQueryHistory(workspaceId as string, historyId as string),
    enabled: Boolean(workspaceId) && Boolean(historyId),
  });
}
