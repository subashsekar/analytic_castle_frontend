"use client";

import { useQuery } from "@tanstack/react-query";
import { getSchema } from "@/features/schema-explorer/api";
import { queryKeys } from "@/lib/query/query-keys";

export function useSchema(
  dataSourceId: string | null,
  schemaId: string | null,
) {
  return useQuery({
    queryKey: queryKeys.schema(dataSourceId ?? "", schemaId ?? ""),
    queryFn: () => getSchema(dataSourceId as string, schemaId as string),
    enabled: Boolean(dataSourceId && schemaId),
  });
}
