import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { dataSourcePaths } from "@/lib/api/paths";
import { unwrapList } from "@/lib/api/normalize";
import { asNonEmptyString, isRecord } from "@/lib/utils/unknown";
import {
  DATA_SOURCE_STATUSES,
  type ConnectionTestResponse,
  type CreateDataSourceRequest,
  type DataSource,
  type DataSourceStatus,
  type UpdateDataSourceRequest,
} from "@/features/data-sources/types";

function asStatus(value: unknown): DataSourceStatus | string {
  if (
    typeof value === "string" &&
    (DATA_SOURCE_STATUSES as readonly string[]).includes(value)
  ) {
    return value as DataSourceStatus;
  }
  return typeof value === "string" && value.trim() ? value : "INACTIVE";
}

function omitSecrets(data: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(data).filter(
      ([key]) =>
        key !== "password" &&
        key !== "encrypted_password" &&
        key !== "connection",
    ),
  );
}

export function normalizeDataSource(raw: unknown): DataSource | null {
  if (!isRecord(raw) || !asNonEmptyString(raw.id)) {
    return null;
  }

  const safe = omitSecrets(raw);
  const workspaceId = asNonEmptyString(safe.workspace_id);
  if (!workspaceId) {
    return null;
  }

  return {
    id: String(safe.id),
    workspace_id: workspaceId,
    name: asNonEmptyString(safe.name) ?? "Data source",
    type: asNonEmptyString(safe.type) ?? "POSTGRESQL",
    status: asStatus(safe.status),
    created_by: asNonEmptyString(safe.created_by) ?? "",
    created_at: asNonEmptyString(safe.created_at) ?? "",
    updated_at: asNonEmptyString(safe.updated_at) ?? "",
    last_tested_at: asNonEmptyString(safe.last_tested_at) ?? null,
  };
}

function requireDataSource(raw: unknown, fallback: string): DataSource {
  const dataSource = normalizeDataSource(raw);
  if (!dataSource) {
    throw new ApiError(fallback, 500);
  }
  return dataSource;
}

export function toCreateDataSourceRequest(
  payload: CreateDataSourceRequest,
): CreateDataSourceRequest {
  return {
    workspace_id: payload.workspace_id,
    name: payload.name,
    type: "POSTGRESQL",
    connection: {
      host: payload.connection.host,
      port: payload.connection.port,
      database_name: payload.connection.database_name,
      username: payload.connection.username,
      password: payload.connection.password,
      ssl_mode: payload.connection.ssl_mode,
    },
  };
}

export function toUpdateDataSourceRequest(
  payload: UpdateDataSourceRequest,
): UpdateDataSourceRequest {
  return { name: payload.name };
}

export async function listDataSources(
  workspaceId: string,
): Promise<DataSource[]> {
  const { data } = await api.get(dataSourcePaths.root, {
    params: { workspace_id: workspaceId },
  });
  return unwrapList(data)
    .map(normalizeDataSource)
    .filter((item): item is DataSource => item !== null)
    .filter((item) => item.workspace_id === workspaceId);
}

export async function getDataSource(dataSourceId: string): Promise<DataSource> {
  const { data } = await api.get(dataSourcePaths.byId(dataSourceId));
  return requireDataSource(data, "Data source could not be loaded.");
}

export async function createDataSource(
  payload: CreateDataSourceRequest,
): Promise<DataSource> {
  const { data } = await api.post(
    dataSourcePaths.root,
    toCreateDataSourceRequest(payload),
  );
  return requireDataSource(
    data,
    "Data source was created but the response was invalid.",
  );
}

export async function updateDataSource(
  dataSourceId: string,
  payload: UpdateDataSourceRequest,
): Promise<DataSource> {
  const { data } = await api.patch(
    dataSourcePaths.byId(dataSourceId),
    toUpdateDataSourceRequest(payload),
  );
  return (
    normalizeDataSource(data) ?? {
      id: dataSourceId,
      workspace_id: "",
      name: payload.name,
      type: "POSTGRESQL",
      status: "INACTIVE",
      created_by: "",
      created_at: "",
      updated_at: "",
      last_tested_at: null,
    }
  );
}

export async function deleteDataSource(dataSourceId: string): Promise<void> {
  await api.delete(dataSourcePaths.byId(dataSourceId));
}

export async function testDataSourceConnection(
  dataSourceId: string,
): Promise<ConnectionTestResponse> {
  const { data } = await api.post(dataSourcePaths.testConnection(dataSourceId));
  const record = isRecord(data) ? data : {};
  return {
    success: record.success === true,
    message:
      asNonEmptyString(record.message) ??
      (record.success === true
        ? "Connection successful."
        : "Unable to connect to the data source."),
  };
}
