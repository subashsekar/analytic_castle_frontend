"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { MetadataSearch } from "@/features/schema-explorer/components/metadata-search";
import { metadataErrorMessage } from "@/features/schema-explorer/errors";
import { qualifyName, tableTypeLabel } from "@/features/schema-explorer/labels";
import type {
  MetadataTable,
  TableType,
} from "@/features/schema-explorer/types";

const TABLE_TYPE_FILTERS: { id: TableType | ""; label: string }[] = [
  { id: "", label: "All" },
  { id: "TABLE", label: "Tables" },
  { id: "VIEW", label: "Views" },
];

export function TableList({
  tables,
  selectedId,
  onSelect,
  search,
  onSearchChange,
  tableType,
  onTableTypeChange,
  loading,
  error,
  hasNextPage,
  fetchingNextPage,
  onLoadMore,
}: {
  tables: MetadataTable[];
  selectedId: string | null;
  onSelect: (table: MetadataTable) => void;
  search: string;
  onSearchChange: (value: string) => void;
  tableType: TableType | "";
  onTableTypeChange: (value: TableType | "") => void;
  loading: boolean;
  error: unknown;
  hasNextPage: boolean;
  fetchingNextPage: boolean;
  onLoadMore: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-col">
      <div className="space-y-2 border-b border-border p-3">
        <MetadataSearch
          id="table-search"
          label="Search tables"
          value={search}
          onChange={onSearchChange}
          placeholder="Search tables"
        />
        <div
          className="flex flex-wrap gap-1"
          role="group"
          aria-label="Filter by table type"
        >
          {TABLE_TYPE_FILTERS.map((filter) => {
            const selected = tableType === filter.id;
            return (
              <button
                key={filter.id || "all"}
                type="button"
                aria-pressed={selected}
                className={`ac-focus-ring rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${
                  selected
                    ? "bg-signal-tint text-signal"
                    : "bg-sunken text-text-3 hover:text-text-1"
                }`}
                onClick={() => onTableTypeChange(filter.id)}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading && tables.length === 0 ? (
        <div className="space-y-2 p-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Spinner label="Loading tables" />
        </div>
      ) : null}

      {error ? (
        <div className="p-3">
          <Alert>{metadataErrorMessage(error)}</Alert>
        </div>
      ) : null}

      {!loading && !error && tables.length === 0 ? (
        <p className="px-4 py-8 text-center text-[13.5px] font-semibold text-text-1">
          {search.trim() || tableType
            ? "No matching tables found."
            : "No tables found."}
        </p>
      ) : null}

      {tables.length > 0 ? (
        <ul className="flex flex-col" aria-label="Tables">
          {tables.map((table) => {
            const selected = table.id === selectedId;
            return (
              <li key={table.id}>
                <button
                  type="button"
                  aria-current={selected ? "true" : undefined}
                  className={`ac-focus-ring flex w-full min-h-11 items-start justify-between gap-2 border-l-2 px-3 py-2.5 text-left transition-colors ${
                    selected
                      ? "border-signal bg-signal-tint"
                      : "border-transparent hover:bg-sunken"
                  }`}
                  onClick={() => onSelect(table)}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-[13px] font-semibold text-text-1">
                      {qualifyName(table.schema_name, table.name)}
                    </span>
                    <span className="mt-0.5 block text-[11.5px] text-text-3">
                      {table.column_count}{" "}
                      {table.column_count === 1 ? "column" : "columns"}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-sunken px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.03em] text-text-3">
                    {tableTypeLabel(table.table_type)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

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
