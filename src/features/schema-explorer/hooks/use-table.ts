"use client";

import { useQuery } from "@tanstack/react-query";
import { getTable } from "@/features/schema-explorer/api";
import { queryKeys } from "@/lib/query/query-keys";

export function useTable(dataSourceId: string | null, tableId: string | null) {
  return useQuery({
    queryKey: queryKeys.table(dataSourceId ?? "", tableId ?? ""),
    queryFn: () => getTable(dataSourceId as string, tableId as string),
    enabled: Boolean(dataSourceId && tableId),
  });
}
