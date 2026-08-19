"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { listTables } from "@/features/schema-explorer/api";
import {
  METADATA_PAGE_SIZE,
  type TableType,
} from "@/features/schema-explorer/types";
import { queryKeys } from "@/lib/query/query-keys";

export function useTables(
  dataSourceId: string | null,
  schemaId: string | null,
  search = "",
  tableType?: TableType,
) {
  const normalizedSearch = search.trim();
  const query = useInfiniteQuery({
    queryKey: queryKeys.tables(
      dataSourceId ?? "",
      schemaId ?? "",
      normalizedSearch,
      tableType ?? null,
    ),
    queryFn: ({ pageParam }) =>
      listTables(dataSourceId as string, {
        schemaId: schemaId as string,
        search: normalizedSearch || undefined,
        tableType,
        page: pageParam,
        pageSize: METADATA_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.page_size;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
    enabled: Boolean(dataSourceId && schemaId),
  });

  const items = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;

  return {
    ...query,
    items,
    total,
  };
}
