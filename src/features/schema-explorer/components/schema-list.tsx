"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { metadataErrorMessage } from "@/features/schema-explorer/errors";
import type { MetadataSchema } from "@/features/schema-explorer/types";

export function SchemaList({
  schemas,
  selectedId,
  onSelect,
  loading,
  error,
  hasNextPage,
  fetchingNextPage,
  onLoadMore,
}: {
  schemas: MetadataSchema[];
  selectedId: string | null;
  onSelect: (schema: MetadataSchema) => void;
  loading: boolean;
  error: unknown;
  hasNextPage: boolean;
  fetchingNextPage: boolean;
  onLoadMore: () => void;
}) {
  if (loading && schemas.length === 0) {
    return (
      <div className="space-y-2 p-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Spinner label="Loading schemas" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3">
        <Alert>{metadataErrorMessage(error)}</Alert>
      </div>
    );
  }

  if (schemas.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-[13.5px] font-semibold text-text-1">
        No schemas found.
      </p>
    );
  }

  return (
    <div>
      <ul className="flex flex-col" aria-label="Schemas">
        {schemas.map((schema) => {
          const selected = schema.id === selectedId;
          return (
            <li key={schema.id}>
              <button
                type="button"
                aria-current={selected ? "true" : undefined}
                className={`ac-focus-ring flex w-full min-h-11 flex-col items-start gap-0.5 border-l-2 px-3 py-2.5 text-left transition-colors ${
                  selected
                    ? "border-signal bg-signal-tint"
                    : "border-transparent hover:bg-sunken"
                }`}
                onClick={() => onSelect(schema)}
              >
                <span className="w-full truncate font-mono text-[13px] font-semibold text-text-1">
                  {schema.name}
                </span>
                <span className="text-[11.5px] text-text-3">
                  {schema.table_count}{" "}
                  {schema.table_count === 1 ? "table" : "tables"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {hasNextPage ? (
        <div className="p-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onLoadMore}
            loading={fetchingNextPage}
            disabled={fetchingNextPage}
          >
            {fetchingNextPage ? "Loading…" : "Load more"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
