"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useDataSource } from "@/features/data-sources/hooks/use-data-sources";
import { dataSourceTypeLabel } from "@/features/data-sources/components/data-source-status";
import { MetadataSearch } from "@/features/schema-explorer/components/metadata-search";
import { MetadataSync } from "@/features/schema-explorer/components/metadata-sync";
import { SchemaList } from "@/features/schema-explorer/components/schema-list";
import { SyncStatus } from "@/features/schema-explorer/components/sync-status";
import { TableDetails } from "@/features/schema-explorer/components/table-details";
import { TableList } from "@/features/schema-explorer/components/table-list";
import { metadataErrorMessage } from "@/features/schema-explorer/errors";
import { useMetadataSearch } from "@/features/schema-explorer/hooks/use-metadata-search";
import {
  useSyncMetadata,
  useSyncStatus,
} from "@/features/schema-explorer/hooks/use-sync-metadata";
import { useSchemas } from "@/features/schema-explorer/hooks/use-schemas";
import { useTables } from "@/features/schema-explorer/hooks/use-tables";
import { searchTypeLabel } from "@/features/schema-explorer/labels";
import {
  METADATA_SEARCH_TYPES,
  supportsMetadata,
  type MetadataSchema,
  type MetadataSearchItem,
  type MetadataSearchType,
  type MetadataTable,
  type TableType,
} from "@/features/schema-explorer/types";
import { getErrorStatus } from "@/lib/api/errors";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSpinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

type MobilePane = "schemas" | "tables" | "details";

function useDebouncedValue(value: string, delay = 300): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function DataSourceExplorerPage() {
  const params = useParams<{ id: string }>();
  const dataSourceId = params.id;
  if (!dataSourceId) {
    return <PageSpinner label="Loading data source" />;
  }
  return <DataSourceExplorer dataSourceId={dataSourceId} />;
}

export function DataSourceExplorer({ dataSourceId }: { dataSourceId: string }) {
  const { workspace } = useAuth();
  return (
    <DataSourceExplorerSession
      key={`${workspace?.id ?? ""}:${dataSourceId}`}
      dataSourceId={dataSourceId}
    />
  );
}

function DataSourceExplorerSession({ dataSourceId }: { dataSourceId: string }) {
  const { workspace, can } = useAuth();
  const canRead = can("data_source:read");
  const canSync = can("data_source:update");
  const dataSourceQuery = useDataSource(dataSourceId);
  const dataSource = dataSourceQuery.data;
  const belongsToWorkspace =
    !dataSource || !workspace?.id || dataSource.workspace_id === workspace.id;
  const metadataEnabled = Boolean(
    dataSource && supportsMetadata(dataSource.type),
  );

  const [selectedSchema, setSelectedSchema] = useState<MetadataSchema | null>(
    null,
  );
  const [selectedTable, setSelectedTable] = useState<MetadataTable | null>(
    null,
  );
  const [pendingTable, setPendingTable] = useState<{
    schemaName: string;
    tableName: string;
  } | null>(null);
  const [tableSearch, setTableSearch] = useState("");
  const [tableType, setTableType] = useState<TableType | "">("");
  const [columnSearch, setColumnSearch] = useState("");
  const [mobilePane, setMobilePane] = useState<MobilePane>("schemas");
  const [globalSearch, setGlobalSearch] = useState("");
  const [searchType, setSearchType] = useState<MetadataSearchType | "">("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error">(
    "success",
  );

  const debouncedTableSearch = useDebouncedValue(tableSearch);
  const debouncedGlobalSearch = useDebouncedValue(globalSearch);

  const catalogAllowed = canRead && belongsToWorkspace && metadataEnabled;
  const syncQuery = useSyncStatus(catalogAllowed ? dataSourceId : null);
  const sync = useSyncMetadata(dataSourceId);
  const syncStatus = syncQuery.data?.status;
  const catalogReady =
    syncStatus === "SUCCESS" ||
    syncStatus === "FAILED" ||
    syncStatus === "RUNNING";
  const schemas = useSchemas(
    catalogAllowed && catalogReady ? dataSourceId : null,
  );
  const onlySchema = schemas.items.length === 1 ? schemas.items[0] : undefined;
  const activeSchema = selectedSchema ?? onlySchema ?? null;
  const tables = useTables(
    catalogAllowed && catalogReady ? dataSourceId : null,
    activeSchema?.id ?? null,
    debouncedTableSearch,
    tableType || undefined,
  );
  const pendingTableMatch = pendingTable
    ? (tables.items.find(
        (item) =>
          item.name === pendingTable.tableName &&
          item.schema_name === pendingTable.schemaName,
      ) ?? null)
    : null;
  const activeTable = selectedTable ?? pendingTableMatch;
  const metadataSearch = useMetadataSearch(
    catalogAllowed && catalogReady ? dataSourceId : null,
    debouncedGlobalSearch,
    searchType || undefined,
  );

  const status = getErrorStatus(dataSourceQuery.error);
  const searchResultsId = useId();
  const syncing = sync.isPending || syncStatus === "RUNNING";

  function resetSelection() {
    setSelectedSchema(null);
    setSelectedTable(null);
    setPendingTable(null);
    setTableSearch("");
    setTableType("");
    setColumnSearch("");
    setMobilePane("schemas");
  }

  function selectSchema(schema: MetadataSchema) {
    setSelectedSchema(schema);
    setSelectedTable(null);
    setPendingTable(null);
    setTableSearch("");
    setColumnSearch("");
    setMobilePane("tables");
  }

  function selectTable(table: MetadataTable) {
    setSelectedTable(table);
    setPendingTable(null);
    setColumnSearch("");
    setMobilePane("details");
  }

  function applySearchResult(item: MetadataSearchItem) {
    const schema = schemas.items.find(
      (candidate) => candidate.name === item.schema_name,
    );
    if (schema) {
      setSelectedSchema(schema);
      setMobilePane("tables");
    }
    if (item.table_name) {
      setPendingTable({
        schemaName: item.schema_name,
        tableName: item.table_name,
      });
      setSelectedTable(null);
      setTableSearch("");
      setMobilePane("details");
    } else {
      setSelectedTable(null);
      setPendingTable(null);
    }
    if (item.column_name) {
      setColumnSearch(item.column_name);
    } else {
      setColumnSearch("");
    }
    setGlobalSearch("");
  }

  async function handleSync() {
    setFeedback(null);
    try {
      await sync.mutateAsync();
      resetSelection();
      setFeedbackTone("success");
      setFeedback("Metadata synchronized successfully.");
    } catch (error) {
      setFeedbackTone("error");
      setFeedback(metadataErrorMessage(error));
      if (getErrorStatus(error) === 409) {
        await syncQuery.refetch();
      }
    }
  }

  if (!canRead) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-text-1">
          Schema explorer
        </h1>
        <Alert>You do not have permission to do that.</Alert>
      </div>
    );
  }

  if (dataSourceQuery.isLoading && !dataSource) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <PageSpinner label="Loading data source" />
      </div>
    );
  }

  if (status === 403 || status === 404 || !belongsToWorkspace) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-text-1">
          Schema explorer
        </h1>
        <Alert>Data source not found.</Alert>
        <Link
          href="/data-sources"
          className="text-[13px] font-semibold text-link"
        >
          Back to data sources
        </Link>
      </div>
    );
  }

  if (dataSourceQuery.isError || !dataSource) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-text-1">
          Schema explorer
        </h1>
        <Alert>Data source details could not be loaded.</Alert>
      </div>
    );
  }

  const showSearchResults =
    Boolean(debouncedGlobalSearch) &&
    (metadataSearch.isFetching || Boolean(metadataSearch.data));
  const syncControl =
    canSync && metadataEnabled ? (
      <MetadataSync
        onSync={() => void handleSync()}
        syncing={syncing}
        disabled={syncing}
      />
    ) : null;

  return (
    <div className="space-y-5" aria-busy={sync.isPending}>
      <div>
        <p className="text-[12px] font-semibold text-text-3">
          <Link href="/data-sources" className="text-text-2 hover:text-link">
            Data sources
          </Link>
          <span className="mx-1.5 opacity-50">/</span>
          <Link
            href={`/data-sources/${dataSource.id}`}
            className="text-text-2 hover:text-link"
          >
            {dataSource.name}
          </Link>
          <span className="mx-1.5 opacity-50">/</span>
          <span className="text-text-1">Explorer</span>
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-text-1">
              {dataSource.name}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-text-3">
              <span>{dataSourceTypeLabel(dataSource.type)}</span>
              {metadataEnabled ? (
                <>
                  <span aria-hidden>·</span>
                  <SyncStatus sync={syncQuery.data} syncing={syncing} />
                </>
              ) : null}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">{syncControl}</div>
        </div>
      </div>

      {feedback ? <Alert tone={feedbackTone}>{feedback}</Alert> : null}
      {syncStatus === "FAILED" && syncQuery.data?.error_message ? (
        <Alert>{syncQuery.data.error_message}</Alert>
      ) : null}
      {syncQuery.isError ? (
        <Alert>{metadataErrorMessage(syncQuery.error)}</Alert>
      ) : null}
      {sync.isPending ? (
        <Alert tone="success">
          Synchronizing metadata… This can take a while. Keep this page open.
        </Alert>
      ) : null}

      {!metadataEnabled ? (
        <EmptyState
          title="Metadata sync is not supported yet"
          description="Metadata synchronization and sample preview are currently available for PostgreSQL data sources only."
        />
      ) : null}

      {metadataEnabled && syncQuery.isLoading && !syncQuery.data ? (
        <PageSpinner label="Loading metadata status" />
      ) : null}

      {metadataEnabled && syncStatus === "PENDING" ? (
        <EmptyState
          title="Metadata has not been synchronized yet"
          description={
            canSync
              ? "Synchronize metadata to inspect schemas, tables, columns, and relationships."
              : "A workspace admin must synchronize metadata before you can browse this catalog."
          }
        />
      ) : null}

      {metadataEnabled &&
      syncStatus === "FAILED" &&
      !schemas.isLoading &&
      schemas.items.length === 0 &&
      !syncQuery.isLoading ? (
        <EmptyState
          title="Metadata synchronization failed"
          description={
            canSync
              ? "The last successful catalog is unavailable. Retry synchronization to inspect this database."
              : "The last successful catalog is unavailable. Ask a workspace admin to retry synchronization."
          }
        />
      ) : null}

      {metadataEnabled && catalogReady ? (
        <div className="relative max-w-xl space-y-2">
          <MetadataSearch
            id="metadata-search"
            label="Search schemas, tables, and columns"
            value={globalSearch}
            onChange={setGlobalSearch}
            placeholder="Search schemas, tables, and columns"
          />
          <div
            className="flex flex-wrap gap-1"
            role="group"
            aria-label="Search type"
          >
            {[
              { id: "", label: "All" },
              ...METADATA_SEARCH_TYPES.map((type) => ({
                id: type,
                label: searchTypeLabel(type),
              })),
            ].map((filter) => {
              const selected = searchType === filter.id;
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
                  onClick={() =>
                    setSearchType(filter.id as MetadataSearchType | "")
                  }
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
          {showSearchResults ? (
            <div
              id={searchResultsId}
              className="ac-dropdown-enter absolute z-20 mt-1 w-full rounded-sm border border-border bg-elevated p-1.5 shadow-md"
              role="listbox"
              aria-label="Metadata search results"
            >
              {metadataSearch.isFetching && !metadataSearch.data ? (
                <p className="px-2.5 py-2 text-[13px] text-text-3">
                  Searching…
                </p>
              ) : null}
              {metadataSearch.isError ? (
                <p className="px-2.5 py-2 text-[13px] text-error">
                  {metadataErrorMessage(metadataSearch.error)}
                </p>
              ) : null}
              {metadataSearch.data && metadataSearch.data.items.length === 0 ? (
                <p className="px-2.5 py-2 text-[13px] text-text-3">
                  No matching metadata found.
                </p>
              ) : null}
              {metadataSearch.data?.truncated ? (
                <p className="px-2.5 py-2 text-[12px] text-text-3">
                  More results exist. Refine your search.
                </p>
              ) : null}
              {metadataSearch.data?.items.map((item, index) => (
                <button
                  key={`${item.metadata_type}-${item.schema_name}-${item.table_name}-${item.column_name}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={false}
                  className="flex w-full flex-col items-start rounded-[6px] px-2.5 py-2 text-left hover:bg-sunken"
                  onClick={() => applySearchResult(item)}
                >
                  <span className="text-[11.5px] font-semibold uppercase tracking-[0.03em] text-text-3">
                    {searchTypeLabel(String(item.metadata_type))}
                  </span>
                  <span className="font-mono text-[13px] text-text-1">
                    {item.column_name
                      ? `${item.schema_name}.${item.table_name}.${item.column_name}`
                      : item.table_name
                        ? `${item.schema_name}.${item.table_name}`
                        : item.schema_name}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {metadataEnabled &&
      catalogReady &&
      schemas.isLoading &&
      schemas.items.length === 0 ? (
        <div className="space-y-2">
          <Skeleton className="h-24 w-full" />
          <PageSpinner label="Loading schemas" />
        </div>
      ) : null}

      {metadataEnabled && catalogReady && schemas.isError ? (
        <Alert>{metadataErrorMessage(schemas.error)}</Alert>
      ) : null}

      {metadataEnabled &&
      catalogReady &&
      syncStatus !== "FAILED" &&
      !schemas.isLoading &&
      !schemas.isError &&
      schemas.items.length === 0 ? (
        <EmptyState
          title="No schemas found."
          description={
            canSync
              ? "Synchronize metadata again if this database should contain schemas."
              : "No database schemas are available for this data source."
          }
        />
      ) : null}

      {metadataEnabled && catalogReady && schemas.items.length > 0 ? (
        <>
          <div className="flex items-center gap-2 lg:hidden">
            {mobilePane !== "schemas" ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setMobilePane(mobilePane === "details" ? "tables" : "schemas")
                }
              >
                <ChevronLeft size={16} strokeWidth={1.5} />
                {mobilePane === "details" ? "Tables" : "Schemas"}
              </Button>
            ) : null}
            <p className="truncate text-[13px] font-semibold text-text-2">
              {mobilePane === "schemas"
                ? "Schemas"
                : mobilePane === "tables"
                  ? activeSchema?.name
                  : activeTable?.name}
            </p>
          </div>

          <div
            className={`grid min-h-[420px] overflow-hidden rounded-md border border-border bg-surface lg:grid-cols-[200px_240px_minmax(0,1fr)] ${
              sync.isPending ? "pointer-events-none opacity-60" : ""
            }`}
          >
            <section
              className={`min-h-0 overflow-y-auto border-b border-border lg:border-b-0 lg:border-r ${
                mobilePane === "schemas" ? "block" : "hidden lg:block"
              }`}
              aria-label="Schemas"
            >
              <div className="hidden border-b border-border px-3 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.03em] text-text-3 lg:block">
                Schemas
              </div>
              <SchemaList
                schemas={schemas.items}
                selectedId={activeSchema?.id ?? null}
                onSelect={selectSchema}
                loading={schemas.isLoading}
                error={schemas.error}
                hasNextPage={Boolean(schemas.hasNextPage)}
                fetchingNextPage={schemas.isFetchingNextPage}
                onLoadMore={() => void schemas.fetchNextPage()}
              />
            </section>

            <section
              className={`min-h-0 overflow-y-auto border-b border-border lg:border-b-0 lg:border-r ${
                mobilePane === "tables" ? "block" : "hidden lg:block"
              }`}
              aria-label="Tables"
            >
              <div className="hidden border-b border-border px-3 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.03em] text-text-3 lg:block">
                Tables
              </div>
              {activeSchema ? (
                <TableList
                  tables={tables.items}
                  selectedId={activeTable?.id ?? null}
                  onSelect={selectTable}
                  search={tableSearch}
                  onSearchChange={setTableSearch}
                  tableType={tableType}
                  onTableTypeChange={setTableType}
                  loading={tables.isLoading}
                  error={tables.error}
                  hasNextPage={Boolean(tables.hasNextPage)}
                  fetchingNextPage={tables.isFetchingNextPage}
                  onLoadMore={() => void tables.fetchNextPage()}
                />
              ) : (
                <p className="px-4 py-8 text-center text-[13.5px] font-semibold text-text-1">
                  Select a schema to view tables.
                </p>
              )}
            </section>

            <section
              className={`min-w-0 overflow-y-auto p-4 sm:p-5 ${
                mobilePane === "details" ? "block" : "hidden lg:block"
              }`}
              aria-label="Table details"
            >
              {activeTable ? (
                <TableDetails
                  key={activeTable.id}
                  dataSourceId={dataSourceId}
                  table={activeTable}
                  columnSearch={columnSearch}
                  onColumnSearchChange={setColumnSearch}
                  sampleEnabled={metadataEnabled}
                />
              ) : pendingTable && tables.isLoading ? (
                <PageSpinner label="Loading tables" />
              ) : (
                <p className="py-8 text-center text-[13.5px] font-semibold text-text-1">
                  Select a table to inspect columns, relationships, and sample
                  data.
                </p>
              )}
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
