"use client";

import { Badge } from "@/components/ui/badge";
import { formatTimestamp } from "@/features/data-sources/components/data-source-status";
import { syncStatusLabel } from "@/features/schema-explorer/labels";
import type { MetadataSyncResult } from "@/features/schema-explorer/types";

function statusTone(
  status: string,
): "ready" | "processing" | "failed" | "neutral" {
  if (status === "SUCCESS") {
    return "ready";
  }
  if (status === "RUNNING") {
    return "processing";
  }
  if (status === "FAILED") {
    return "failed";
  }
  return "neutral";
}

function countLabel(
  value: number | null | undefined,
  singular: string,
): string | null {
  if (typeof value !== "number") {
    return null;
  }
  return `${value} ${value === 1 ? singular : `${singular}s`}`;
}

export function SyncStatus({
  sync,
  syncing = false,
}: {
  sync: MetadataSyncResult | null | undefined;
  syncing?: boolean;
}) {
  const status = syncing ? "RUNNING" : (sync?.status ?? "PENDING");
  const timestamp = sync?.completed_at ?? null;
  const counts = [
    countLabel(sync?.schemas, "schema"),
    countLabel(sync?.tables, "table"),
    countLabel(sync?.columns, "column"),
    countLabel(sync?.relationships, "relationship"),
  ].filter((item): item is string => Boolean(item));

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Badge tone={statusTone(status)}>{syncStatusLabel(status)}</Badge>
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
