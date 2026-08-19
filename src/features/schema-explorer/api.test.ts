import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { metadataPaths } from "@/lib/api/paths";
import {
  getMetadataSyncStatus,
  getSampleData,
  getSchema,
  getTable,
  listColumns,
  listRelationships,
  listSchemas,
  listTables,
  normalizeColumn,
  normalizeSampleData,
  normalizeSchema,
  searchMetadata,
  syncMetadata,
} from "@/features/schema-explorer/api";

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
};

const schema = {
  id: "sch-1",
  data_source_id: "ds-1",
  name: "public",
  table_count: 2,
  created_at: "2026-08-18T10:00:00Z",
  updated_at: "2026-08-18T10:00:00Z",
};

describe("schema explorer API", () => {
  beforeEach(() => {
    mockedApi.post.mockReset();
    mockedApi.get.mockReset();
  });

  it("lists schemas with clamped pagination", async () => {
    mockedApi.get.mockResolvedValue({
      data: { items: [schema], page: 1, page_size: 50, total: 1 },
    });

    await expect(listSchemas("ds-1", { pageSize: 500 })).resolves.toEqual({
      items: [expect.objectContaining({ id: "sch-1", name: "public" })],
      page: 1,
      page_size: 50,
      total: 1,
    });
    expect(mockedApi.get).toHaveBeenCalledWith(metadataPaths.schemas("ds-1"), {
      params: { page: 1, page_size: 100 },
    });
  });

  it("drops schemas that belong to another data source", async () => {
    mockedApi.get.mockResolvedValue({
      data: {
        items: [schema, { ...schema, id: "sch-x", data_source_id: "ds-2" }],
        page: 1,
        page_size: 50,
        total: 2,
      },
    });

    const page = await listSchemas("ds-1");
    expect(page.items).toEqual([
      expect.objectContaining({ id: "sch-1", data_source_id: "ds-1" }),
    ]);
  });

  it("loads one schema and table", async () => {
    mockedApi.get
      .mockResolvedValueOnce({ data: schema })
      .mockResolvedValueOnce({
        data: {
          id: "tbl-1",
          data_source_id: "ds-1",
          schema_id: "sch-1",
          schema_name: "public",
          name: "customers",
          table_type: "TABLE",
          description: null,
          column_count: 2,
          created_at: "2026-08-18T10:00:00Z",
          updated_at: "2026-08-18T10:00:00Z",
        },
      });

    await expect(getSchema("ds-1", "sch-1")).resolves.toEqual(
      expect.objectContaining({ name: "public" }),
    );
    await expect(getTable("ds-1", "tbl-1")).resolves.toEqual(
      expect.objectContaining({ schema_name: "public", name: "customers" }),
    );
  });

  it("lists tables with schema, search, and type filters", async () => {
    mockedApi.get.mockResolvedValue({
      data: { items: [], page: 1, page_size: 50, total: 0 },
    });

    await listTables("ds-1", {
      schemaId: "sch-1",
      search: "cust",
      tableType: "VIEW",
    });
    expect(mockedApi.get).toHaveBeenCalledWith(metadataPaths.tables("ds-1"), {
      params: {
        page: 1,
        page_size: 50,
        schema_id: "sch-1",
        search: "cust",
        table_type: "VIEW",
      },
    });
  });

  it("lists columns for a table", async () => {
    mockedApi.get.mockResolvedValue({
      data: {
        items: [
          {
            id: "col-1",
            table_id: "tbl-1",
            name: "id",
            ordinal_position: 1,
            data_type: "integer",
            database_type: "int4",
            is_nullable: false,
            is_primary_key: true,
            is_unique: true,
            default_value: null,
            description: null,
            created_at: "2026-08-18T10:00:00Z",
            updated_at: "2026-08-18T10:00:00Z",
          },
        ],
        page: 1,
        page_size: 50,
        total: 1,
      },
    });

    const page = await listColumns("ds-1", "tbl-1");
    expect(page.items[0]?.is_primary_key).toBe(true);
    expect(mockedApi.get).toHaveBeenCalledWith(
      metadataPaths.columns("ds-1", "tbl-1"),
      { params: { page: 1, page_size: 50 } },
    );
  });

  it("lists relationships", async () => {
    mockedApi.get.mockResolvedValue({
      data: { items: [], page: 1, page_size: 50, total: 0 },
    });
    await listRelationships("ds-1");
    expect(mockedApi.get).toHaveBeenCalledWith(
      metadataPaths.relationships("ds-1"),
      { params: { page: 1, page_size: 50 } },
    );
  });

  it("searches metadata with a clamped limit", async () => {
    mockedApi.get.mockResolvedValue({
      data: {
        items: [
          {
            metadata_type: "TABLE",
            schema_name: "public",
            table_name: "customers",
            column_name: null,
            description: null,
          },
        ],
        total: 1,
        limit: 50,
        truncated: false,
      },
    });

    const result = await searchMetadata("ds-1", { q: "cust", limit: 500 });
    expect(result.items[0]?.table_name).toBe("customers");
    expect(mockedApi.get).toHaveBeenCalledWith(metadataPaths.search("ds-1"), {
      params: { q: "cust", metadata_type: undefined, limit: 100 },
    });
  });

  it("does not send empty search queries", async () => {
    await expect(searchMetadata("ds-1", { q: "   " })).rejects.toBeInstanceOf(
      ApiError,
    );
    expect(mockedApi.get).not.toHaveBeenCalled();
  });

  it("reads and synchronizes metadata", async () => {
    mockedApi.get.mockResolvedValue({
      data: {
        status: "PENDING",
        started_at: null,
        completed_at: null,
        schemas: null,
        tables: null,
        columns: null,
        relationships: null,
        error_message: null,
      },
    });
    mockedApi.post.mockResolvedValue({
      data: {
        status: "SUCCESS",
        started_at: "2026-08-18T10:00:00Z",
        completed_at: "2026-08-18T10:01:00Z",
        schemas: 1,
        tables: 2,
        columns: 8,
        relationships: 1,
        error_message: null,
      },
    });

    await expect(getMetadataSyncStatus("ds-1")).resolves.toEqual(
      expect.objectContaining({ status: "PENDING" }),
    );
    await expect(syncMetadata("ds-1")).resolves.toEqual(
      expect.objectContaining({ status: "SUCCESS", schemas: 1 }),
    );
    expect(mockedApi.post).toHaveBeenCalledWith(
      metadataPaths.sync("ds-1"),
      undefined,
      { timeout: 120_000 },
    );
  });

  it("loads sample data without extra fields", async () => {
    mockedApi.post.mockResolvedValue({
      data: {
        data_source_id: "ds-1",
        table_id: "tbl-1",
        schema_name: "public",
        table_name: "customers",
        table_type: "TABLE",
        columns: [
          {
            name: "email",
            data_type: "string",
            sensitivity: "PII",
            masked: true,
          },
        ],
        rows: [{ email: "***" }],
        row_count: 1,
        row_limit: 10,
        truncated_columns: false,
      },
    });

    const sample = await getSampleData("ds-1", "tbl-1");
    expect(sample.rows).toEqual([{ email: "***" }]);
    expect(mockedApi.post).toHaveBeenCalledWith(
      metadataPaths.sample("ds-1", "tbl-1"),
      {},
      { timeout: 120_000 },
    );
  });

  it("clamps sample limits and never sends unmasked flags", async () => {
    mockedApi.post.mockResolvedValue({
      data: {
        data_source_id: "ds-1",
        table_id: "tbl-1",
        schema_name: "public",
        table_name: "customers",
        table_type: "TABLE",
        columns: [],
        rows: [],
        row_count: 0,
        row_limit: 100,
        truncated_columns: false,
      },
    });

    await getSampleData("ds-1", "tbl-1", 10000);
    expect(mockedApi.post).toHaveBeenCalledWith(
      metadataPaths.sample("ds-1", "tbl-1"),
      { limit: 100 },
      { timeout: 120_000 },
    );
  });

  it("drops incomplete metadata records", () => {
    expect(normalizeSchema({ id: "x" })).toBeNull();
    expect(normalizeColumn({ id: "x", name: "id" })).toBeNull();
    expect(normalizeSampleData({ rows: [] })).toBeNull();
  });
});
