"use client";

import { useQuery } from "@tanstack/react-query";
import { searchMetadata } from "@/features/schema-explorer/api";
import {
  METADATA_SEARCH_LIMIT,
  type MetadataSearchType,
} from "@/features/schema-explorer/types";
import { queryKeys } from "@/lib/query/query-keys";

export function useMetadataSearch(
  dataSourceId: string | null,
  query: string,
  metadataType?: MetadataSearchType,
) {
  const normalized = query.trim();

  return useQuery({
    queryKey: queryKeys.metadataSearch(
      dataSourceId ?? "",
      normalized,
      metadataType ?? null,
    ),
    queryFn: () =>
      searchMetadata(dataSourceId as string, {
        q: normalized,
        metadataType,
        limit: METADATA_SEARCH_LIMIT,
      }),
    enabled: Boolean(dataSourceId && normalized),
  });
}
