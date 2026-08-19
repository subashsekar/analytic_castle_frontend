"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ColumnList } from "@/features/schema-explorer/components/column-list";
import { RelationshipView } from "@/features/schema-explorer/components/relationship-view";
import { SampleDataPreview } from "@/features/schema-explorer/components/sample-data-preview";
import { useColumns } from "@/features/schema-explorer/hooks/use-columns";
import { useRelationships } from "@/features/schema-explorer/hooks/use-relationships";
import { useSampleData } from "@/features/schema-explorer/hooks/use-sample-data";
import { qualifyName, tableTypeLabel } from "@/features/schema-explorer/labels";
import {
  SAMPLE_DATA_DEFAULT_LIMIT,
  type MetadataTable,
} from "@/features/schema-explorer/types";

type DetailTab = "schema" | "relationships" | "preview";

const tabs: { id: DetailTab; label: string }[] = [
  { id: "schema", label: "Schema" },
  { id: "relationships", label: "Relationships" },
  { id: "preview", label: "Data preview" },
];

export function TableDetails({
  dataSourceId,
  table,
  columnSearch,
  onColumnSearchChange,
  sampleEnabled,
}: {
  dataSourceId: string;
  table: MetadataTable;
  columnSearch: string;
  onColumnSearchChange: (value: string) => void;
  sampleEnabled: boolean;
}) {
  const [tab, setTab] = useState<DetailTab>("schema");
  const [sampleLimit, setSampleLimit] = useState(SAMPLE_DATA_DEFAULT_LIMIT);
  const columns = useColumns(dataSourceId, table.id);
  const relationships = useRelationships(dataSourceId, Boolean(table.id));
  const sample = useSampleData(dataSourceId, table.id);

  return (
    <div className="min-w-0 space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-mono text-[16px] font-bold text-text-1">
            {qualifyName(table.schema_name, table.name)}
          </h2>
          <Badge>{tableTypeLabel(table.table_type)}</Badge>
        </div>
        <p className="mt-1 text-[13px] text-text-3">
          {table.column_count
            ? `${table.column_count} ${table.column_count === 1 ? "column" : "columns"}`
            : ""}
          {table.description ? ` · ${table.description}` : ""}
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Table details"
        className="flex gap-5 overflow-x-auto border-b border-border"
      >
        {tabs.map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              id={`table-tab-${item.id}`}
              className={`ac-focus-ring shrink-0 border-b-2 px-0 py-2 text-[13.5px] font-semibold transition-colors ${
                selected
                  ? "border-link text-link"
                  : "border-transparent text-text-3 hover:text-text-1"
              }`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        aria-labelledby={`table-tab-${tab}`}
        className="min-w-0"
      >
        {tab === "schema" ? (
          <ColumnList
            columns={columns.items}
            relationships={relationships.items}
            search={columnSearch}
            onSearchChange={onColumnSearchChange}
            loading={columns.isLoading}
            error={columns.error}
            hasNextPage={Boolean(columns.hasNextPage)}
            fetchingNextPage={columns.isFetchingNextPage}
            onLoadMore={() => void columns.fetchNextPage()}
          />
        ) : null}

        {tab === "relationships" ? (
          <RelationshipView
            relationships={relationships.items}
            tableId={table.id}
            loading={relationships.isLoading}
            error={relationships.error}
            hasNextPage={Boolean(relationships.hasNextPage)}
            fetchingNextPage={relationships.isFetchingNextPage}
            onLoadMore={() => void relationships.fetchNextPage()}
          />
        ) : null}

        {tab === "preview" ? (
          <SampleDataPreview
            sample={sample.data}
            loading={sample.isPending}
            error={sample.error}
            enabled={sampleEnabled}
            limit={sampleLimit}
            onLimitChange={setSampleLimit}
            onPreview={() => {
              if (sampleEnabled) {
                void sample.mutateAsync(sampleLimit);
              }
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
