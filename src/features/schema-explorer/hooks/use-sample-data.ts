"use client";

import { useMutation } from "@tanstack/react-query";
import { getSampleData } from "@/features/schema-explorer/api";
import {
  SAMPLE_DATA_DEFAULT_LIMIT,
  type SampleData,
} from "@/features/schema-explorer/types";

export function useSampleData(
  dataSourceId: string | null,
  tableId: string | null,
) {
  return useMutation<SampleData, Error, number>({
    mutationFn: (limit = SAMPLE_DATA_DEFAULT_LIMIT) =>
      getSampleData(dataSourceId as string, tableId as string, limit),
  });
}
