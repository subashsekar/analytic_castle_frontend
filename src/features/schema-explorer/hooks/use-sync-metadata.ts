"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMetadataSyncStatus,
  syncMetadata,
} from "@/features/schema-explorer/api";
import { getErrorStatus } from "@/lib/api/errors";
import { queryKeys } from "@/lib/query/query-keys";

export function useSyncStatus(dataSourceId: string | null) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.syncStatus(dataSourceId ?? ""),
    queryFn: () => getMetadataSyncStatus(dataSourceId as string),
    enabled: Boolean(dataSourceId),
    refetchInterval: (current) =>
      current.state.data?.status === "RUNNING" ? 2500 : false,
  });

  const status = query.data?.status;
  const previousStatus = useRef(status);

  useEffect(() => {
    if (
      dataSourceId &&
      previousStatus.current === "RUNNING" &&
      (status === "SUCCESS" || status === "FAILED")
    ) {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.metadata(dataSourceId),
      });
    }
    previousStatus.current = status;
  }, [dataSourceId, queryClient, status]);

  return query;
}

export function useSyncMetadata(dataSourceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => syncMetadata(dataSourceId as string),
    onSuccess: async (result) => {
      if (!dataSourceId) {
        return;
      }
      queryClient.setQueryData(queryKeys.syncStatus(dataSourceId), result);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.metadata(dataSourceId),
      });
    },
    onError: async (error) => {
      if (!dataSourceId) {
        return;
      }
      if (getErrorStatus(error) === 409) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.syncStatus(dataSourceId),
        });
      }
    },
  });
}
