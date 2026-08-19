"use client";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { MetadataSearch } from "@/features/schema-explorer/components/metadata-search";
import { metadataErrorMessage } from "@/features/schema-explorer/errors";
import { matchesQuery, qualifyName } from "@/features/schema-explorer/labels";
import type {
  MetadataColumn,
  MetadataRelationship,
} from "@/features/schema-explorer/types";

export function ColumnList({
  columns,
  relationships,
  search,
  onSearchChange,
  loading,
  error,
  hasNextPage,
  fetchingNextPage,
  onLoadMore,
}: {
  columns: MetadataColumn[];
  relationships: MetadataRelationship[];
  search: string;
  onSearchChange: (value: string) => void;
  loading: boolean;
  error: unknown;
  hasNextPage: boolean;
  fetchingNextPage: boolean;
  onLoadMore: () => void;
}) {
  const filtered = columns.filter(
    (column) =>
      matchesQuery(column.name, search) ||
      matchesQuery(column.data_type, search) ||
      matchesQuery(column.database_type, search),
  );

  return (
    <div className="space-y-3">
      <MetadataSearch
        id="column-search"
        label="Search columns"
        value={search}
        onChange={onSearchChange}
        placeholder="Search columns"
      />

      {loading && columns.length === 0 ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Spinner label="Loading columns" />
        </div>
      ) : null}

      {error ? <Alert>{metadataErrorMessage(error)}</Alert> : null}

      {!loading && !error && columns.length === 0 ? (
        <p className="py-8 text-center text-[13.5px] font-semibold text-text-1">
          No columns found.
        </p>
      ) : null}

      {!loading && !error && columns.length > 0 && filtered.length === 0 ? (
        <p className="py-8 text-center text-[13.5px] font-semibold text-text-1">
          No matching columns found.
        </p>
      ) : null}

      {filtered.length > 0 ? (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px] border-collapse text-[13px]">
              <thead>
                <tr>
                  <th className="border-b border-border-strong bg-sunken px-3.5 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-[0.03em] text-text-3">
                    Column
                  </th>
                  <th className="border-b border-border-strong bg-sunken px-3.5 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-[0.03em] text-text-3">
                    Type
                  </th>
                  <th className="border-b border-border-strong bg-sunken px-3.5 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-[0.03em] text-text-3">
                    Database type
                  </th>
                  <th className="border-b border-border-strong bg-sunken px-3.5 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-[0.03em] text-text-3">
                    Nullable
                  </th>
                  <th className="border-b border-border-strong bg-sunken px-3.5 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-[0.03em] text-text-3">
                    Default
                  </th>
                  <th className="border-b border-border-strong bg-sunken px-3.5 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-[0.03em] text-text-3">
                    Keys
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((column) => (
                  <ColumnRow
                    key={column.id}
                    column={column}
                    relationship={outboundFor(relationships, column.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-border md:hidden" aria-label="Columns">
            {filtered.map((column) => (
              <ColumnCard
                key={column.id}
                column={column}
                relationship={outboundFor(relationships, column.id)}
              />
            ))}
          </ul>
        </>
      ) : null}

      {hasNextPage ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onLoadMore}
          loading={fetchingNextPage}
          disabled={fetchingNextPage}
        >
          {fetchingNextPage ? "Loading…" : "Load more"}
        </Button>
      ) : null}
    </div>
  );
}

function outboundFor(
  relationships: MetadataRelationship[],
  columnId: string,
): MetadataRelationship | undefined {
  return relationships.find(
    (relationship) => relationship.source_column_id === columnId,
  );
}

function ColumnRow({
  column,
  relationship,
}: {
  column: MetadataColumn;
  relationship?: MetadataRelationship;
}) {
  return (
    <tr className="hover:bg-sunken">
      <td className="border-b border-border px-3.5 py-[11px] font-mono text-[13px] font-medium text-text-1">
        {column.name}
      </td>
      <td className="border-b border-border px-3.5 py-[11px] font-mono text-[12.5px] text-text-2">
        {column.data_type}
      </td>
      <td className="border-b border-border px-3.5 py-[11px] font-mono text-[12.5px] text-text-3">
        {column.database_type || "—"}
      </td>
      <td className="border-b border-border px-3.5 py-[11px] text-text-2">
        {column.is_nullable ? "Nullable" : "Required"}
      </td>
      <td className="border-b border-border px-3.5 py-[11px] font-mono text-[12px] text-text-3">
        {column.default_value ?? "—"}
      </td>
      <td className="border-b border-border px-3.5 py-[11px]">
        <KeyBadges column={column} relationship={relationship} />
      </td>
    </tr>
  );
}

function ColumnCard({
  column,
  relationship,
}: {
  column: MetadataColumn;
  relationship?: MetadataRelationship;
}) {
  return (
    <li className="px-1 py-3">
      <p className="font-mono text-[13px] font-semibold text-text-1">
        {column.name}
      </p>
      <p className="mt-1 font-mono text-[12px] text-text-3">
        {column.data_type}
        {column.database_type && column.database_type !== column.data_type
          ? ` · ${column.database_type}`
          : ""}
      </p>
      <p className="mt-1 text-[12px] text-text-3">
        {column.is_nullable ? "Nullable" : "Required"}
        {column.default_value ? ` · Default ${column.default_value}` : ""}
      </p>
      <div className="mt-2">
        <KeyBadges column={column} relationship={relationship} />
      </div>
    </li>
  );
}

function KeyBadges({
  column,
  relationship,
}: {
  column: MetadataColumn;
  relationship?: MetadataRelationship;
}) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {column.is_primary_key ? <Badge tone="ready">Primary key</Badge> : null}
      {column.is_unique && !column.is_primary_key ? (
        <Badge>Unique</Badge>
      ) : null}
      {relationship ? (
        <Badge tone="processing">
          Foreign key →{" "}
          {qualifyName(
            relationship.target_schema_name,
            relationship.target_table_name,
            relationship.target_column_name,
          )}
        </Badge>
      ) : null}
    </span>
  );
}
