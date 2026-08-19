import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api/client";
import { dataSourcePaths } from "@/lib/api/paths";
import {
  createDataSource,
  deleteDataSource,
  getDataSource,
  listDataSources,
  normalizeDataSource,
  testDataSourceConnection,
  updateDataSource,
} from "@/features/data-sources/api";
import type {
  CreateDataSourceRequest,
  UpdateDataSourceRequest,
} from "@/features/data-sources/types";

vi.mock("@/lib/api/client", () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApi = api as unknown as {
  post: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const source = {
  id: "ds-1",
  workspace_id: "ws-1",
  name: "Analytics",
  type: "POSTGRESQL",
  status: "INACTIVE",
  created_by: "user-1",
  created_at: "2026-08-16T10:00:00Z",
  updated_at: "2026-08-16T10:00:00Z",
  last_tested_at: null,
};

describe("data source API", () => {
  beforeEach(() => {
    mockedApi.post.mockReset();
    mockedApi.get.mockReset();
    mockedApi.patch.mockReset();
    mockedApi.delete.mockReset();
  });

  it("lists data sources for the active workspace only", async () => {
    mockedApi.get.mockResolvedValue({
      data: [source, { ...source, id: "ds-2", workspace_id: "ws-other" }],
    });

    await expect(listDataSources("ws-1")).resolves.toEqual([
      expect.objectContaining({ id: "ds-1", workspace_id: "ws-1" }),
    ]);
    expect(mockedApi.get).toHaveBeenCalledWith(dataSourcePaths.root, {
      params: { workspace_id: "ws-1" },
    });
  });

  it("creates a PostgreSQL data source", async () => {
    mockedApi.post.mockResolvedValue({ data: source });

    await expect(
      createDataSource({
        workspace_id: "ws-1",
        name: "Analytics",
        type: "POSTGRESQL",
        connection: {
          host: "db.example.com",
          port: 5432,
          database_name: "analytics",
          username: "reader",
          password: "secret",
          ssl_mode: "require",
        },
      }),
    ).resolves.toMatchObject({ id: "ds-1", name: "Analytics" });

    expect(mockedApi.post).toHaveBeenCalledWith(dataSourcePaths.root, {
      workspace_id: "ws-1",
      name: "Analytics",
      type: "POSTGRESQL",
      connection: {
        host: "db.example.com",
        port: 5432,
        database_name: "analytics",
        username: "reader",
        password: "secret",
        ssl_mode: "require",
      },
    });
  });

  it("loads a data source without copying secrets", async () => {
    mockedApi.get.mockResolvedValue({
      data: {
        ...source,
        password: "should-not-leak",
        encrypted_password: "v1:cipher",
        connection: { password: "nested-secret" },
      },
    });

    const result = await getDataSource("ds-1");
    expect(result).toEqual(source);
    expect(JSON.stringify(result)).not.toContain("should-not-leak");
    expect(JSON.stringify(result)).not.toContain("v1:cipher");
    expect(mockedApi.get).toHaveBeenCalledWith(dataSourcePaths.byId("ds-1"));
  });

  it("updates only the data source name", async () => {
    mockedApi.patch.mockResolvedValue({
      data: { ...source, name: "Renamed" },
    });

    await expect(
      updateDataSource("ds-1", { name: "Renamed" }),
    ).resolves.toMatchObject({ name: "Renamed" });
    expect(mockedApi.patch).toHaveBeenCalledWith(dataSourcePaths.byId("ds-1"), {
      name: "Renamed",
    });
  });

  it("deletes a data source", async () => {
    mockedApi.delete.mockResolvedValue({
      data: { detail: "Data source deleted" },
    });
    await deleteDataSource("ds-1");
    expect(mockedApi.delete).toHaveBeenCalledWith(dataSourcePaths.byId("ds-1"));
  });

  it("tests a stored connection without a request body", async () => {
    mockedApi.post.mockResolvedValue({
      data: { success: true, message: "Connection successful." },
    });

    await expect(testDataSourceConnection("ds-1")).resolves.toEqual({
      success: true,
      message: "Connection successful.",
    });
    expect(mockedApi.post).toHaveBeenCalledTimes(1);
    expect(mockedApi.post.mock.calls[0]).toEqual([
      dataSourcePaths.testConnection("ds-1"),
    ]);
  });

  it("drops disallowed create and update fields", async () => {
    mockedApi.post.mockResolvedValue({ data: source });
    mockedApi.patch.mockResolvedValue({
      data: { ...source, name: "Renamed" },
    });

    await createDataSource({
      workspace_id: "ws-1",
      name: "Analytics",
      type: "POSTGRESQL",
      connection: {
        host: "db.example.com",
        port: 5432,
        database_name: "analytics",
        username: "reader",
        password: "secret",
        ssl_mode: "require",
      },
      ...({
        status: "ACTIVE",
        created_by: "user-1",
      } as object),
    } as CreateDataSourceRequest);

    expect(mockedApi.post.mock.calls[0][1]).toEqual({
      workspace_id: "ws-1",
      name: "Analytics",
      type: "POSTGRESQL",
      connection: {
        host: "db.example.com",
        port: 5432,
        database_name: "analytics",
        username: "reader",
        password: "secret",
        ssl_mode: "require",
      },
    });

    await updateDataSource("ds-1", {
      name: "Renamed",
      ...({
        status: "ACTIVE",
        workspace_id: "ws-other",
        created_by: "user-2",
      } as object),
    } as UpdateDataSourceRequest);

    expect(mockedApi.patch).toHaveBeenCalledWith(dataSourcePaths.byId("ds-1"), {
      name: "Renamed",
    });
  });

  it("omits secret fields from normalized metadata", () => {
    const normalized = normalizeDataSource({
      ...source,
      password: "plaintext",
      encrypted_password: "v1:cipher",
    });
    expect(normalized).not.toHaveProperty("password");
    expect(normalized).not.toHaveProperty("encrypted_password");
    expect(normalized).not.toHaveProperty("connection");
  });
});
