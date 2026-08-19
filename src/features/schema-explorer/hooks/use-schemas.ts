"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { listSchemas } from "@/features/schema-explorer/api";
import { METADATA_PAGE_SIZE } from "@/features/schema-explorer/types";
import { queryKeys } from "@/lib/query/query-keys";

export function useSchemas(dataSourceId: string | null) {
  const query = useInfiniteQuery({
    queryKey: queryKeys.schemas(dataSourceId ?? ""),
    queryFn: ({ pageParam }) =>
      listSchemas(dataSourceId as string, {
        page: pageParam,
        pageSize: METADATA_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.page_size;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
    enabled: Boolean(dataSourceId),
  });

  const items = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;

  return {
    ...query,
    items,
    total,
  };
}
