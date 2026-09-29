import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { metadataPaths } from "@/lib/api/paths";
import { asNonEmptyString, isRecord } from "@/lib/utils/unknown";
import {
  COLUMN_SENSITIVITIES,
  CUSTOMER_DB_TIMEOUT_MS,
  METADATA_PAGE_SIZE,
  METADATA_PAGE_SIZE_MAX,
  METADATA_SEARCH_LIMIT,
  METADATA_SEARCH_LIMIT_MAX,
  METADATA_SEARCH_MAX_QUERY_LENGTH,
  METADATA_SEARCH_TYPES,
  METADATA_SYNC_STATUSES,
  RELATIONSHIP_TYPES,
  SAMPLE_DATA_MAX_LIMIT,
  TABLE_TYPES,
  type ColumnSensitivity,
  type ListPageParams,
  type ListTablesParams,
  type MetadataColumn,
  type MetadataPage,
  type MetadataRelationship,
  type MetadataSchema,
  type MetadataSearchItem,
  type MetadataSearchResponse,
  type MetadataSearchType,
  type MetadataSyncResult,
  type MetadataSyncStatus,
  type MetadataTable,
  type RelationshipType,
  type SampleColumn,
  type SampleData,
  type SampleRow,
  type SearchMetadataParams,
  type TableType,
} from "@/features/schema-explorer/types";

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asInt(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.trunc(value)
    : fallback;
}

function asNullableInt(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.trunc(value)
    : null;
}

function asEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T | string,
): T | string {
  if (
    typeof value === "string" &&
    (allowed as readonly string[]).includes(value)
  ) {
    return value as T;
  }
  return typeof value === "string" && value.trim() ? value : fallback;
}

function unwrapPage<T>(
  data: unknown,
  normalize: (raw: unknown) => T | null,
): MetadataPage<T> {
  const record = isRecord(data) ? data : {};
  const rawItems = Array.isArray(record.items)
    ? record.items
    : Array.isArray(data)
      ? data
      : [];

  return {
    items: rawItems.map(normalize).filter((item): item is T => item !== null),
    page: asInt(record.page, 1),
    page_size: asInt(record.page_size, METADATA_PAGE_SIZE),
    total: asInt(record.total, 0),
  };
}

export function normalizeSchema(raw: unknown): MetadataSchema | null {
  if (!isRecord(raw) || !asNonEmptyString(raw.id)) {
    return null;
  }

  const dataSourceId = asNonEmptyString(raw.data_source_id);
  const name = asNonEmptyString(raw.name);
  if (!dataSourceId || !name) {
    return null;
  }

  return {
    id: String(raw.id),
    data_source_id: dataSourceId,
    name,
    table_count: asInt(raw.table_count),
    created_at: asNonEmptyString(raw.created_at) ?? "",
    updated_at: asNonEmptyString(raw.updated_at) ?? "",
  };
}

export function normalizeTable(raw: unknown): MetadataTable | null {
  if (!isRecord(raw) || !asNonEmptyString(raw.id)) {
    return null;
  }

  const dataSourceId = asNonEmptyString(raw.data_source_id);
  const schemaId = asNonEmptyString(raw.schema_id);
  const name = asNonEmptyString(raw.name);
  if (!dataSourceId || !schemaId || !name) {
    return null;
  }

  return {
    id: String(raw.id),
    data_source_id: dataSourceId,
    schema_id: schemaId,
    schema_name: asNonEmptyString(raw.schema_name) ?? "",
    name,
    table_type: asEnum<TableType>(raw.table_type, TABLE_TYPES, "TABLE"),
    description: asNonEmptyString(raw.description) ?? null,
    column_count: asInt(raw.column_count),
    created_at: asNonEmptyString(raw.created_at) ?? "",
    updated_at: asNonEmptyString(raw.updated_at) ?? "",
  };
}

export function normalizeColumn(raw: unknown): MetadataColumn | null {
  if (!isRecord(raw) || !asNonEmptyString(raw.id)) {
    return null;
  }

  const tableId = asNonEmptyString(raw.table_id);
  const name = asNonEmptyString(raw.name);
  if (!tableId || !name) {
    return null;
  }

  return {
    id: String(raw.id),
    table_id: tableId,
    name,
    ordinal_position: asInt(raw.ordinal_position),
    data_type: asNonEmptyString(raw.data_type) ?? "",
    database_type: asNonEmptyString(raw.database_type) ?? "",
    is_nullable: asBoolean(raw.is_nullable),
    is_primary_key: asBoolean(raw.is_primary_key),
    is_unique: asBoolean(raw.is_unique),
    default_value: asNonEmptyString(raw.default_value) ?? null,
    description: asNonEmptyString(raw.description) ?? null,
    created_at: asNonEmptyString(raw.created_at) ?? "",
    updated_at: asNonEmptyString(raw.updated_at) ?? "",
  };
}

export function normalizeRelationship(
  raw: unknown,
): MetadataRelationship | null {
  if (!isRecord(raw) || !asNonEmptyString(raw.id)) {
    return null;
  }

  const sourceTableId = asNonEmptyString(raw.source_table_id);
  const sourceColumnId = asNonEmptyString(raw.source_column_id);
  const targetTableId = asNonEmptyString(raw.target_table_id);
  const targetColumnId = asNonEmptyString(raw.target_column_id);
  if (!sourceTableId || !sourceColumnId || !targetTableId || !targetColumnId) {
    return null;
  }

  return {
    id: String(raw.id),
    source_table_id: sourceTableId,
    source_schema_name: asNonEmptyString(raw.source_schema_name) ?? "",
    source_table_name: asNonEmptyString(raw.source_table_name) ?? "",
    source_column_id: sourceColumnId,
    source_column_name: asNonEmptyString(raw.source_column_name) ?? "",
    target_table_id: targetTableId,
    target_schema_name: asNonEmptyString(raw.target_schema_name) ?? "",
    target_table_name: asNonEmptyString(raw.target_table_name) ?? "",
    target_column_id: targetColumnId,
    target_column_name: asNonEmptyString(raw.target_column_name) ?? "",
    relationship_type: asEnum<RelationshipType>(
      raw.relationship_type,
      RELATIONSHIP_TYPES,
      "MANY_TO_ONE",
    ),
    constraint_name: asNonEmptyString(raw.constraint_name) ?? null,
    created_at: asNonEmptyString(raw.created_at) ?? "",
    updated_at: asNonEmptyString(raw.updated_at) ?? "",
  };
}

export function normalizeSearchItem(raw: unknown): MetadataSearchItem | null {
  if (!isRecord(raw)) {
    return null;
  }

  const schemaName = asNonEmptyString(raw.schema_name);
  if (!schemaName) {
    return null;
  }

  return {
    metadata_type: asEnum<MetadataSearchType>(
      raw.metadata_type,
      METADATA_SEARCH_TYPES,
      "TABLE",
    ),
    schema_name: schemaName,
    table_name: asNonEmptyString(raw.table_name) ?? null,
    column_name: asNonEmptyString(raw.column_name) ?? null,
    description: asNonEmptyString(raw.description) ?? null,
  };
}

export function normalizeSyncResult(raw: unknown): MetadataSyncResult {
  const record = isRecord(raw) ? raw : {};
  return {
    status: asEnum<MetadataSyncStatus>(
      record.status,
      METADATA_SYNC_STATUSES,
      "PENDING",
    ),
    started_at: asNonEmptyString(record.started_at) ?? null,
    completed_at: asNonEmptyString(record.completed_at) ?? null,
    schemas: asNullableInt(record.schemas),
    tables: asNullableInt(record.tables),
    columns: asNullableInt(record.columns),
    relationships: asNullableInt(record.relationships),
    error_message: asNonEmptyString(record.error_message) ?? null,
  };
}

function normalizeSampleColumn(raw: unknown): SampleColumn | null {
  if (!isRecord(raw)) {
    return null;
  }
  const name = asNonEmptyString(raw.name);
  if (!name) {
    return null;
  }
  return {
    name,
    data_type: asNonEmptyString(raw.data_type) ?? "",
    sensitivity: asEnum<ColumnSensitivity>(
      raw.sensitivity,
      COLUMN_SENSITIVITIES,
      "PUBLIC",
    ),
    masked: asBoolean(raw.masked),
  };
}

function normalizeSampleRow(raw: unknown): SampleRow | null {
  return isRecord(raw) ? { ...raw } : null;
}

export function normalizeSampleData(raw: unknown): SampleData | null {
  if (!isRecord(raw)) {
    return null;
  }

  const dataSourceId = asNonEmptyString(raw.data_source_id);
  const tableId = asNonEmptyString(raw.table_id);
  if (!dataSourceId || !tableId) {
    return null;
  }

  const columns = Array.isArray(raw.columns)
    ? raw.columns
        .map(normalizeSampleColumn)
        .filter((item): item is SampleColumn => item !== null)
    : [];
  const rows = Array.isArray(raw.rows)
    ? raw.rows
        .map(normalizeSampleRow)
        .filter((item): item is SampleRow => item !== null)
    : [];

  return {
    data_source_id: dataSourceId,
    table_id: tableId,
    schema_name: asNonEmptyString(raw.schema_name) ?? "",
    table_name: asNonEmptyString(raw.table_name) ?? "",
    table_type: asEnum<TableType>(raw.table_type, TABLE_TYPES, "TABLE"),
    columns,
    rows,
    row_count: asInt(raw.row_count, rows.length),
    row_limit: asInt(raw.row_limit, rows.length),
    truncated_columns: asBoolean(raw.truncated_columns),
  };
}

function clampInt(
  value: number | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  const parsed =
    typeof value === "number" && Number.isFinite(value)
      ? Math.trunc(value)
      : fallback;
  return Math.min(Math.max(parsed, min), max);
}

function pageParams(params?: ListPageParams): {
  page: number;
  page_size: number;
} {
  return {
    page: clampInt(params?.page, 1, 1, Number.MAX_SAFE_INTEGER),
    page_size: clampInt(
      params?.pageSize,
      METADATA_PAGE_SIZE,
      1,
      METADATA_PAGE_SIZE_MAX,
    ),
  };
}

function scopedPage<T extends { data_source_id: string }>(
  page: MetadataPage<T>,
  dataSourceId: string,
): MetadataPage<T> {
  return {
    ...page,
    items: page.items.filter((item) => item.data_source_id === dataSourceId),
  };
}

export async function listSchemas(
  dataSourceId: string,
  params?: ListPageParams,
): Promise<MetadataPage<MetadataSchema>> {
  const { data } = await api.get(metadataPaths.schemas(dataSourceId), {
    params: pageParams(params),
  });
  return scopedPage(unwrapPage(data, normalizeSchema), dataSourceId);
}

export async function getSchema(
  dataSourceId: string,
  schemaId: string,
): Promise<MetadataSchema> {
  const { data } = await api.get(metadataPaths.schema(dataSourceId, schemaId));
  const schema = normalizeSchema(data);
  if (!schema || schema.data_source_id !== dataSourceId) {
    throw new ApiError("Schema not found", 404);
  }
  return schema;
}

export async function listTables(
  dataSourceId: string,
  params?: ListTablesParams,
): Promise<MetadataPage<MetadataTable>> {
  const paging = pageParams(params);
  const search = params?.search
    ?.trim()
    .slice(0, METADATA_SEARCH_MAX_QUERY_LENGTH);
  const { data } = await api.get(metadataPaths.tables(dataSourceId), {
    params: {
      ...paging,
      schema_id: params?.schemaId || undefined,
      search: search || undefined,
      table_type: params?.tableType || undefined,
    },
  });
  return scopedPage(unwrapPage(data, normalizeTable), dataSourceId);
}

export async function getTable(
  dataSourceId: string,
  tableId: string,
): Promise<MetadataTable> {
  const { data } = await api.get(metadataPaths.table(dataSourceId, tableId));
  const table = normalizeTable(data);
  if (!table || table.data_source_id !== dataSourceId) {
    throw new ApiError("Table not found", 404);
  }
  return table;
}

export async function listColumns(
  dataSourceId: string,
  tableId: string,
  params?: ListPageParams,
): Promise<MetadataPage<MetadataColumn>> {
  const { data } = await api.get(metadataPaths.columns(dataSourceId, tableId), {
    params: pageParams(params),
  });
  const page = unwrapPage(data, normalizeColumn);
  return {
    ...page,
    items: page.items.filter((item) => item.table_id === tableId),
  };
}

export async function listRelationships(
  dataSourceId: string,
  params?: ListPageParams,
): Promise<MetadataPage<MetadataRelationship>> {
  const { data } = await api.get(metadataPaths.relationships(dataSourceId), {
    params: pageParams(params),
  });
  return unwrapPage(data, normalizeRelationship);
}

export async function searchMetadata(
  dataSourceId: string,
  params: SearchMetadataParams,
): Promise<MetadataSearchResponse> {
  const query = params.q.trim().slice(0, METADATA_SEARCH_MAX_QUERY_LENGTH);
  if (!query) {
    throw new ApiError("Search query is required", 400);
  }

  const { data } = await api.get(metadataPaths.search(dataSourceId), {
    params: {
      q: query,
      metadata_type: params.metadataType,
      limit: clampInt(
        params.limit,
        METADATA_SEARCH_LIMIT,
        1,
        METADATA_SEARCH_LIMIT_MAX,
      ),
    },
  });
  const record = isRecord(data) ? data : {};
  const items = Array.isArray(record.items)
    ? record.items
        .map(normalizeSearchItem)
        .filter((item): item is MetadataSearchItem => item !== null)
    : [];
  return {
    items,
    total: asInt(record.total, items.length),
    limit: asInt(record.limit, items.length),
    truncated: asBoolean(record.truncated),
  };
}

export async function getMetadataSyncStatus(
  dataSourceId: string,
): Promise<MetadataSyncResult> {
  const { data } = await api.get(metadataPaths.syncStatus(dataSourceId));
  return normalizeSyncResult(data);
}

export async function syncMetadata(
  dataSourceId: string,
): Promise<MetadataSyncResult> {
  const { data } = await api.post(metadataPaths.sync(dataSourceId), undefined, {
    timeout: CUSTOMER_DB_TIMEOUT_MS,
  });
  return normalizeSyncResult(data);
}

export async function nestedSyncMetadata(
  workspaceId: string,
  dataSourceId: string,
): Promise<MetadataSyncResult> {
  try {
    const { data } = await api.post(
      metadataPaths.nestedSync(workspaceId, dataSourceId),
      undefined,
      { timeout: CUSTOMER_DB_TIMEOUT_MS },
    );
    return normalizeSyncResult(data);
  } catch (err: any) {
    if (err.status === 404) {
      return syncMetadata(dataSourceId);
    }
    throw err;
  }
}

export async function nestedGetMetadataSyncStatus(
  workspaceId: string,
  dataSourceId: string,
): Promise<MetadataSyncResult> {
  try {
    const { data } = await api.get(
      metadataPaths.nestedSyncStatus(workspaceId, dataSourceId),
    );
    return normalizeSyncResult(data);
  } catch (err: any) {
    if (err.status === 404) {
      return getMetadataSyncStatus(dataSourceId);
    }
    throw err;
  }
}

export async function getSampleData(
  dataSourceId: string,
  tableId: string,
  limit?: number,
): Promise<SampleData> {
  const body =
    typeof limit === "number"
      ? { limit: clampInt(limit, limit, 1, SAMPLE_DATA_MAX_LIMIT) }
      : {};
  const { data } = await api.post(
    metadataPaths.sample(dataSourceId, tableId),
    body,
    { timeout: CUSTOMER_DB_TIMEOUT_MS },
  );
  const sample = normalizeSampleData(data);
  if (!sample || sample.data_source_id !== dataSourceId) {
    throw new ApiError("Sample data could not be loaded.", 500);
  }
  return sample;
}
