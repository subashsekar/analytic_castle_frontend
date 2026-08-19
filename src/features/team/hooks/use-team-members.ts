"use client";

import { useQuery } from "@tanstack/react-query";
import { listWorkspaceMembers } from "@/features/team/api";
import { queryKeys } from "@/lib/query/query-keys";

export function useTeamMembers(workspaceId: string | null) {
  return useQuery({
    queryKey: queryKeys.workspaceMembers(workspaceId ?? ""),
    queryFn: () => listWorkspaceMembers(workspaceId as string),
    enabled: Boolean(workspaceId),
  });
}
