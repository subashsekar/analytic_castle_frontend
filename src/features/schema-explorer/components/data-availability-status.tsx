"use client";

import { Badge } from "@/components/ui/badge";
import { formatTimestamp } from "@/features/data-sources/components/data-source-status";
import type { DataAvailability } from "@/features/data-sources/product-status";
import {
  dataAvailabilityLabel,
  dataAvailabilityTone,
} from "@/features/data-sources/product-status";
import type { MetadataSyncResult } from "@/features/schema-explorer/types";

function countLabel(
  value: number | null | undefined,
  singular: string,
): string | null {
  if (typeof value !== "number") {
    return null;
  }
  return `${value} ${value === 1 ? singular : `${singular}s`}`;
}

export function DataAvailabilityStatus({
  availability,
  sync,
}: {
  availability: DataAvailability;
  sync: MetadataSyncResult | null | undefined;
}) {
  const timestamp = sync?.completed_at ?? null;
  const counts = [
    countLabel(sync?.schemas, "schema"),
    countLabel(sync?.tables, "table"),
    countLabel(sync?.columns, "column"),
    countLabel(sync?.relationships, "relationship"),
  ].filter((item): item is string => Boolean(item));

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Badge tone={dataAvailabilityTone(availability)}>
        {dataAvailabilityLabel(availability)}
      </Badge>
      {timestamp ? (
        <span className="text-[12px] text-text-3">
          Last synced {formatTimestamp(timestamp)}
        </span>
      ) : null}
      {counts.length > 0 ? (
        <span className="text-[12px] text-text-3">{counts.join(" · ")}</span>
      ) : null}
    </span>
  );
}

