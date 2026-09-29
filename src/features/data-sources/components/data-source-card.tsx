"use client";

import Link from "next/link";
import { Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DataSourceStatusBadge,
  dataSourceTypeLabel,
} from "@/features/data-sources/components/data-source-status";
import type { DataAvailability } from "@/features/data-sources/product-status";
import { DataAvailabilityBadge } from "@/features/data-sources/components/data-availability-badges";
import type { DataSource } from "@/features/data-sources/types";

export function DataSourceCard({
  dataSource,
  testing,
  availability,
  canTest,
  canDelete,
  onTest,
  onDelete,
  className = "",
}: {
  dataSource: DataSource;
  testing: boolean;
  availability?: DataAvailability;
  canTest: boolean;
  canDelete: boolean;
  onTest: () => void;
  onDelete: () => void;
  className?: string;
}) {
  return (
    <li
      className={`flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-[34px] shrink-0 items-center justify-center rounded-sm bg-sunken text-text-2">
          <Database size={16} strokeWidth={1.5} aria-hidden />
        </span>
        <div className="min-w-0">
          <Link
            href={`/data-sources/${dataSource.id}`}
            className="block truncate text-[13px] font-semibold text-text-1 hover:text-link"
          >
            {dataSource.name}
          </Link>
          <p className="mt-0.5 truncate text-[11.5px] text-text-3">
            {dataSourceTypeLabel(dataSource.type)}
          </p>
        </div>
      </div>
      <div className="flex min-h-11 flex-wrap items-center gap-2 sm:min-h-0 sm:shrink-0">
        <DataSourceStatusBadge status={dataSource.status} testing={testing} />
        {availability ? <DataAvailabilityBadge availability={availability} /> : null}
        <Link
          href={`/data-sources/${dataSource.id}`}
          className="ac-focus-ring inline-flex h-8 min-w-11 items-center justify-center rounded-sm border border-border-strong px-3 text-[12.5px] font-semibold text-text-1 hover:border-text-3 hover:bg-sunken"
        >
          View
        </Link>
        <Link
          href={`/data-sources/${dataSource.id}/explore`}
          className="ac-focus-ring inline-flex h-8 min-w-11 items-center justify-center rounded-sm border border-border-strong px-3 text-[12.5px] font-semibold text-text-1 hover:border-text-3 hover:bg-sunken"
        >
          Explore
        </Link>
        {canTest ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onTest}
            disabled={testing}
            loading={testing}
          >
            {testing ? "Testing…" : "Test"}
          </Button>
        ) : null}
        {canDelete ? (
          <Button variant="ghost" size="sm" onClick={onDelete}>
            Delete
          </Button>
        ) : null}
      </div>
    </li>
  );
}
