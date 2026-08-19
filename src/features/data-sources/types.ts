export const DATA_SOURCE_TYPES = ["POSTGRESQL"] as const;
export type DataSourceType = (typeof DATA_SOURCE_TYPES)[number];

export const DATA_SOURCE_STATUSES = ["ACTIVE", "INACTIVE", "ERROR"] as const;
export type DataSourceStatus = (typeof DATA_SOURCE_STATUSES)[number];

export const SSL_MODES = [
  "disable",
  "allow",
  "prefer",
  "require",
  "verify-ca",
  "verify-full",
] as const;
export type SslMode = (typeof SSL_MODES)[number];

export const DEFAULT_POSTGRES_PORT = 5432;
export const DEFAULT_SSL_MODE: SslMode = "require";
export const MAX_SECRET_LENGTH = 512;

export const SSL_MODE_LABELS: Record<SslMode, string> = {
  disable: "Disable",
  allow: "Allow",
  prefer: "Prefer",
  require: "Require",
  "verify-ca": "Verify CA",
  "verify-full": "Verify full",
};

export type DataSource = {
  id: string;
  workspace_id: string;
  name: string;
  type: string;
  status: DataSourceStatus | string;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_tested_at: string | null;
};

export type PostgresConnectionConfig = {
  host: string;
  port: number;
  database_name: string;
  username: string;
  password: string;
  ssl_mode: SslMode;
};

export type CreateDataSourceRequest = {
  workspace_id: string;
  name: string;
  type: "POSTGRESQL";
  connection: PostgresConnectionConfig;
};

export type UpdateDataSourceRequest = {
  name: string;
};

export type ConnectionTestResponse = {
  success: boolean;
  message: string;
};

export type DataSourceFormValues = {
  name: string;
  host: string;
  port: string;
  database_name: string;
  username: string;
  password: string;
  ssl_mode: string;
};
