"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { listColumns } from "@/features/schema-explorer/api";
import { METADATA_PAGE_SIZE } from "@/features/schema-explorer/types";
import { queryKeys } from "@/lib/query/query-keys";

export function useColumns(
  dataSourceId: string | null,
  tableId: string | null,
) {
  const query = useInfiniteQuery({
    queryKey: queryKeys.columns(dataSourceId ?? "", tableId ?? ""),
    queryFn: ({ pageParam }) =>
      listColumns(dataSourceId as string, tableId as string, {
        page: pageParam,
        pageSize: METADATA_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.page_size;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
    enabled: Boolean(dataSourceId && tableId),
  });

  const items = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;

  return {
    ...query,
    items,
    total,
  };
}
