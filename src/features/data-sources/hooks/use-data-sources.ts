"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDataSource,
  deleteDataSource,
  getDataSource,
  listDataSources,
  testDataSourceConnection,
  updateDataSource,
} from "@/features/data-sources/api";
import type {
  CreateDataSourceRequest,
  UpdateDataSourceRequest,
} from "@/features/data-sources/types";
import { queryKeys } from "@/lib/query/query-keys";

export function useDataSources(workspaceId: string | null) {
  return useQuery({
    queryKey: queryKeys.dataSources(workspaceId ?? ""),
    queryFn: () => listDataSources(workspaceId as string),
    enabled: Boolean(workspaceId),
  });
}

export function useDataSource(dataSourceId: string | null) {
  return useQuery({
    queryKey: queryKeys.dataSource(dataSourceId ?? ""),
    queryFn: () => getDataSource(dataSourceId as string),
    enabled: Boolean(dataSourceId),
  });
}

export function useCreateDataSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDataSourceRequest) => createDataSource(payload),
    gcTime: 0,
    onSuccess: async (dataSource) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.dataSources(dataSource.workspace_id),
        }),
        queryClient.setQueryData(
          queryKeys.dataSource(dataSource.id),
          dataSource,
        ),
      ]);
    },
  });
}

export function useUpdateDataSource(dataSourceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateDataSourceRequest) =>
      updateDataSource(dataSourceId, payload),
    onSuccess: async (dataSource) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.dataSources(dataSource.workspace_id),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.dataSource(dataSourceId),
        }),
      ]);
    },
  });
}

export function useDeleteDataSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dataSourceId,
    }: {
      dataSourceId: string;
      workspaceId: string;
    }) => deleteDataSource(dataSourceId),
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.dataSources(variables.workspaceId),
        }),
        queryClient.removeQueries({
          queryKey: queryKeys.dataSource(variables.dataSourceId),
        }),
        queryClient.removeQueries({
          queryKey: queryKeys.metadata(variables.dataSourceId),
        }),
      ]);
    },
  });
}

export function useTestDataSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dataSourceId: string) =>
      testDataSourceConnection(dataSourceId),
    onSuccess: async (_result, dataSourceId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["data-sources"] }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.dataSource(dataSourceId),
        }),
      ]);
    },
  });
}
