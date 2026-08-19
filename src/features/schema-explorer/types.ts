export const METADATA_PAGE_SIZE = 50;
export const METADATA_PAGE_SIZE_MAX = 100;
export const METADATA_SEARCH_LIMIT = 50;
export const METADATA_SEARCH_LIMIT_MAX = 100;
export const METADATA_SEARCH_MAX_QUERY_LENGTH = 255;
export const SAMPLE_DATA_DEFAULT_LIMIT = 10;
export const SAMPLE_DATA_MAX_LIMIT = 100;
export const SAMPLE_DATA_LIMITS = [10, 25, 50, 100] as const;
export const CUSTOMER_DB_TIMEOUT_MS = 120_000;
export const METADATA_SUPPORTED_TYPES = ["POSTGRESQL"] as const;

export const TABLE_TYPES = ["TABLE", "VIEW"] as const;
export type TableType = (typeof TABLE_TYPES)[number];

export const RELATIONSHIP_TYPES = [
  "ONE_TO_ONE",
  "ONE_TO_MANY",
  "MANY_TO_ONE",
  "MANY_TO_MANY",
] as const;
export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export const METADATA_SYNC_STATUSES = [
  "PENDING",
  "RUNNING",
  "SUCCESS",
  "FAILED",
] as const;
export type MetadataSyncStatus = (typeof METADATA_SYNC_STATUSES)[number];

export const METADATA_SEARCH_TYPES = ["SCHEMA", "TABLE", "COLUMN"] as const;
export type MetadataSearchType = (typeof METADATA_SEARCH_TYPES)[number];

export const COLUMN_SENSITIVITIES = [
  "PUBLIC",
  "SENSITIVE",
  "PII",
  "SECRET",
] as const;
export type ColumnSensitivity = (typeof COLUMN_SENSITIVITIES)[number];

export type MetadataPage<T> = {
  items: T[];
  page: number;
  page_size: number;
  total: number;
};

export type MetadataSchema = {
  id: string;
  data_source_id: string;
  name: string;
  table_count: number;
  created_at: string;
  updated_at: string;
};

export type MetadataTable = {
  id: string;
  data_source_id: string;
  schema_id: string;
  schema_name: string;
  name: string;
  table_type: TableType | string;
  description: string | null;
  column_count: number;
  created_at: string;
  updated_at: string;
};

export type MetadataColumn = {
  id: string;
  table_id: string;
  name: string;
  ordinal_position: number;
  data_type: string;
  database_type: string;
  is_nullable: boolean;
  is_primary_key: boolean;
  is_unique: boolean;
  default_value: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type MetadataRelationship = {
  id: string;
  source_table_id: string;
  source_schema_name: string;
  source_table_name: string;
  source_column_id: string;
  source_column_name: string;
  target_table_id: string;
  target_schema_name: string;
  target_table_name: string;
  target_column_id: string;
  target_column_name: string;
  relationship_type: RelationshipType | string;
  constraint_name: string | null;
  created_at: string;
  updated_at: string;
};

export type MetadataSearchItem = {
  metadata_type: MetadataSearchType | string;
  schema_name: string;
  table_name: string | null;
  column_name: string | null;
  description: string | null;
};

export type MetadataSearchResponse = {
  items: MetadataSearchItem[];
  total: number;
  limit: number;
  truncated: boolean;
};

export type MetadataSyncResult = {
  status: MetadataSyncStatus | string;
  started_at: string | null;
  completed_at: string | null;
  schemas: number | null;
  tables: number | null;
  columns: number | null;
  relationships: number | null;
  error_message: string | null;
};

export type SampleColumn = {
  name: string;
  data_type: string;
  sensitivity: ColumnSensitivity | string;
  masked: boolean;
};

export type SampleRow = Record<string, unknown>;

export type SampleData = {
  data_source_id: string;
  table_id: string;
  schema_name: string;
  table_name: string;
  table_type: TableType | string;
  columns: SampleColumn[];
  rows: SampleRow[];
  row_count: number;
  row_limit: number;
  truncated_columns: boolean;
};

export type ListTablesParams = {
  schemaId?: string;
  search?: string;
  tableType?: TableType;
  page?: number;
  pageSize?: number;
};

export type ListPageParams = {
  page?: number;
  pageSize?: number;
};

export type SearchMetadataParams = {
  q: string;
  metadataType?: MetadataSearchType;
  limit?: number;
};

export function supportsMetadata(type: string): boolean {
  return type === "POSTGRESQL";
}
