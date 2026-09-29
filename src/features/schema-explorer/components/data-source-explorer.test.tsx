import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DataSourceExplorer } from "@/features/schema-explorer/components/data-source-explorer";
import { ApiError } from "@/lib/api/errors";
import { renderWithQuery } from "@/test/render";
import type { Permission } from "@/types/common";

const getDataSource = vi.fn();
const listSchemas = vi.fn();
const listTables = vi.fn();
const listColumns = vi.fn();
const listRelationships = vi.fn();
const searchMetadata = vi.fn();
const getMetadataSyncStatus = vi.fn();
const syncMetadata = vi.fn();
const getSampleData = vi.fn();

let workspaceId = "ws-1";
let permissions: Permission[] = ["data_source:read", "data_source:update"];

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ id: "ds-1" }),
}));

vi.mock("@/features/auth/hooks/use-auth", () => ({
  useAuth: () => ({
    workspace: { id: workspaceId, name: "Main" },
    can: (permission: Permission) => permissions.includes(permission),
  }),
}));

vi.mock("@/features/data-sources/api", () => ({
  getDataSource: (...args: unknown[]) => getDataSource(...args),
}));

vi.mock("@/features/schema-explorer/api", () => ({
  listSchemas: (...args: unknown[]) => listSchemas(...args),
  listTables: (...args: unknown[]) => listTables(...args),
  listColumns: (...args: unknown[]) => listColumns(...args),
  listRelationships: (...args: unknown[]) => listRelationships(...args),
  searchMetadata: (...args: unknown[]) => searchMetadata(...args),
  getMetadataSyncStatus: (...args: unknown[]) => getMetadataSyncStatus(...args),
  syncMetadata: (...args: unknown[]) => syncMetadata(...args),
  getSampleData: (...args: unknown[]) => getSampleData(...args),
}));

const source = {
  id: "ds-1",
  workspace_id: "ws-1",
  name: "Analytics",
  type: "POSTGRESQL",
  status: "ACTIVE",
  created_by: "user-1",
  created_at: "2026-08-16T10:00:00Z",
  updated_at: "2026-08-16T10:00:00Z",
  last_tested_at: "2026-08-16T10:00:00Z",
};

const page = <T,>(items: T[], total = items.length) => ({
  items,
  page: 1,
  page_size: 50,
  total,
});

const publicSchema = {
  id: "sch-1",
  data_source_id: "ds-1",
  name: "public",
  table_count: 2,
  created_at: "2026-08-18T10:00:00Z",
  updated_at: "2026-08-18T10:00:00Z",
};

const reportingSchema = {
  ...publicSchema,
  id: "sch-2",
  name: "reporting",
  table_count: 0,
};

const customers = {
  id: "tbl-1",
  data_source_id: "ds-1",
  schema_id: "sch-1",
  schema_name: "public",
  name: "customers",
  table_type: "TABLE",
  description: "Customer accounts",
  column_count: 2,
  created_at: "2026-08-18T10:00:00Z",
  updated_at: "2026-08-18T10:00:00Z",
};

const orders = {
  ...customers,
  id: "tbl-2",
  name: "orders",
  description: null,
  column_count: 1,
};

const columns = [
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
  {
    id: "col-2",
    table_id: "tbl-1",
    name: "email",
    ordinal_position: 2,
    data_type: "string",
    database_type: "varchar",
    is_nullable: false,
    is_primary_key: false,
    is_unique: true,
    default_value: null,
    description: null,
    created_at: "2026-08-18T10:00:00Z",
    updated_at: "2026-08-18T10:00:00Z",
  },
];

const relationship = {
  id: "rel-1",
  source_table_id: "tbl-2",
  source_schema_name: "public",
  source_table_name: "orders",
  source_column_id: "col-3",
  source_column_name: "customer_id",
  target_table_id: "tbl-1",
  target_schema_name: "public",
  target_table_name: "customers",
  target_column_id: "col-1",
  target_column_name: "id",
  relationship_type: "MANY_TO_ONE",
  constraint_name: "orders_customer_id_fkey",
  created_at: "2026-08-18T10:00:00Z",
  updated_at: "2026-08-18T10:00:00Z",
};

const compositeRelationship = {
  ...relationship,
  id: "rel-2",
  source_column_id: "col-4",
  source_column_name: "org_id",
  target_column_id: "col-0",
  target_column_name: "org_id",
  constraint_name: "orders_customer_id_fkey",
};

const pendingSync = {
  status: "PENDING",
  started_at: null,
  completed_at: null,
  schemas: null,
  tables: null,
  columns: null,
  relationships: null,
  error_message: null,
};

const successSync = {
  status: "SUCCESS",
  started_at: "2026-08-18T10:00:00Z",
  completed_at: "2026-08-18T10:01:00Z",
  schemas: 2,
  tables: 2,
  columns: 3,
  relationships: 1,
  error_message: null,
};

function mockCatalog() {
  getDataSource.mockResolvedValue(source);
  getMetadataSyncStatus.mockResolvedValue(successSync);
  listSchemas.mockResolvedValue(page([publicSchema, reportingSchema]));
  listTables.mockImplementation(
    async (
      _id: string,
      params?: { schemaId?: string; search?: string; tableType?: string },
    ) => {
      let items = [customers, orders];
      if (params?.schemaId === "sch-2") {
        items = [];
      }
      if (params?.search) {
        const needle = params.search.toLowerCase();
        items = items.filter((item) =>
          item.name.toLowerCase().includes(needle),
        );
      }
      if (params?.tableType) {
        items = items.filter((item) => item.table_type === params.tableType);
      }
      return page(items);
    },
  );
  listColumns.mockResolvedValue(page(columns));
  listRelationships.mockResolvedValue(
    page([relationship, compositeRelationship]),
  );
  searchMetadata.mockResolvedValue({
    items: [],
    total: 0,
    limit: 50,
    truncated: false,
  });
  getSampleData.mockResolvedValue({
    data_source_id: "ds-1",
    table_id: "tbl-1",
    schema_name: "public",
    table_name: "customers",
    table_type: "TABLE",
    columns: [
      {
        name: "id",
        data_type: "integer",
        sensitivity: "PUBLIC",
        masked: false,
      },
      { name: "email", data_type: "string", sensitivity: "PII", masked: true },
    ],
    rows: [{ id: 1, email: "***" }],
    row_count: 1,
    row_limit: 10,
    truncated_columns: false,
  });
}

describe("DataSourceExplorer", () => {
  beforeEach(() => {
    getDataSource.mockReset();
    listSchemas.mockReset();
    listTables.mockReset();
    listColumns.mockReset();
    listRelationships.mockReset();
    searchMetadata.mockReset();
    getMetadataSyncStatus.mockReset();
    syncMetadata.mockReset();
    getSampleData.mockReset();
    workspaceId = "ws-1";
    permissions = ["data_source:read", "data_source:update"];
  });

  it("shows a loading state", () => {
    getDataSource.mockReturnValue(new Promise(() => undefined));
    getMetadataSyncStatus.mockReturnValue(new Promise(() => undefined));
    listSchemas.mockReturnValue(new Promise(() => undefined));
    renderWithQuery(<DataSourceExplorer dataSourceId="ds-1" />);
    expect(screen.getByText("Loading data source")).toBeTruthy();
  });

  it("loads schemas, tables, and columns", async () => {
    mockCatalog();
    const user = userEvent.setup();
    renderWithQuery(<DataSourceExplorer dataSourceId="ds-1" />);

    expect(
      await screen.findByRole("heading", { name: "Analytics" }),
    ).toBeTruthy();
    expect(await screen.findByRole("button", { name: /public/i })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /public/i }));
    expect(
      await screen.findByRole("button", { name: /public.customers/i }),
    ).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /public.customers/i }));
    expect(await screen.findAllByText("Primary key")).not.toHaveLength(0);
    expect(screen.getAllByText("email").length).toBeGreaterThan(0);
    expect(listTables).toHaveBeenCalledWith(
      "ds-1",
      expect.objectContaining({ schemaId: "sch-1" }),
    );
    expect(listColumns).toHaveBeenCalledWith(
      "ds-1",
      "tbl-1",
      expect.any(Object),
    );
  });

  it("searches tables through the API", async () => {
    mockCatalog();
    const user = userEvent.setup();
    renderWithQuery(<DataSourceExplorer dataSourceId="ds-1" />);
    await user.click(await screen.findByRole("button", { name: /public/i }));
    await screen.findByRole("button", { name: /public.customers/i });
    await user.type(screen.getByLabelText("Search tables"), "ord");
    await waitFor(() =>
      expect(listTables).toHaveBeenCalledWith(
        "ds-1",
        expect.objectContaining({ schemaId: "sch-1", search: "ord" }),
      ),
    );
  });

  it("shows an empty table search result", async () => {
    mockCatalog();
    const user = userEvent.setup();
    renderWithQuery(<DataSourceExplorer dataSourceId="ds-1" />);
    await user.click(await screen.findByRole("button", { name: /public/i }));
    await screen.findByRole("button", { name: /public.customers/i });
    await user.type(screen.getByLabelText("Search tables"), "missing");
    expect(await screen.findByText("No matching tables found.")).toBeTruthy();
  });

  it("filters tables by type", async () => {
    mockCatalog();
    const user = userEvent.setup();
    renderWithQuery(<DataSourceExplorer dataSourceId="ds-1" />);
    await user.click(await screen.findByRole("button", { name: /public/i }));
    await screen.findByRole("button", { name: /public.customers/i });
    await user.click(screen.getByRole("button", { name: "Views" }));
    await waitFor(() =>
      expect(listTables).toHaveBeenCalledWith(
        "ds-1",
        expect.objectContaining({ schemaId: "sch-1", tableType: "VIEW" }),
      ),
    );
  });

  it("filters columns on the client", async () => {
    mockCatalog();
    const user = userEvent.setup();
    renderWithQuery(<DataSourceExplorer dataSourceId="ds-1" />);
    await user.click(await screen.findByRole("button", { name: /public/i }));
    await user.click(screen.getByRole("button", { name: /public.customers/i }));
    await screen.findAllByText("Primary key");
    await user.type(screen.getByLabelText("Search columns"), "email");
    expect(screen.getAllByText("email").length).toBeGreaterThan(0);
    expect(screen.queryByText("Primary key")).toBeNull();
    await user.clear(screen.getByLabelText("Search columns"));
    await user.type(screen.getByLabelText("Search columns"), "zzz");
    expect(screen.getByText("No matching columns found.")).toBeTruthy();
  });

  it("shows relationships and sample data", async () => {
    mockCatalog();
    const user = userEvent.setup();
    renderWithQuery(<DataSourceExplorer dataSourceId="ds-1" />);
    await user.click(await screen.findByRole("button", { name: /public/i }));
    await user.click(screen.getByRole("button", { name: /public.orders/i }));
    await user.click(screen.getByRole("tab", { name: "Relationships" }));
    expect(await screen.findByText("Many to one")).toBeTruthy();
    expect(screen.getByText(/public.orders.customer_id/)).toBeTruthy();
    expect(screen.getByText(/public.orders.org_id/)).toBeTruthy();
    expect(screen.getByText("Constraint orders_customer_id_fkey")).toBeTruthy();
    await user.click(screen.getByRole("tab", { name: "Data preview" }));
    await user.click(screen.getByRole("button", { name: "Preview sample" }));
    expect(
      await screen.findByText("Showing 1 of up to 10 sample rows."),
    ).toBeTruthy();
    expect(screen.getByText("PII")).toBeTruthy();
    expect(screen.getByText("Masked")).toBeTruthy();
    expect(getSampleData).toHaveBeenCalledWith("ds-1", "tbl-2", 10);
    expect(screen.queryByText(/unmasked/i)).toBeNull();
  });

  it("synchronizes metadata and shows sync status", async () => {
    mockCatalog();
    getMetadataSyncStatus
      .mockResolvedValueOnce(pendingSync)
      .mockResolvedValue(successSync);
    syncMetadata.mockResolvedValue(successSync);
    const user = userEvent.setup();
    renderWithQuery(<DataSourceExplorer dataSourceId="ds-1" />);
    expect(
      await screen.findByText("Metadata has not been synchronized yet"),
    ).toBeTruthy();
    await user.click(
      screen.getByRole("button", { name: "Synchronize metadata" }),
    );
    expect(
      await screen.findByText("Metadata synchronized successfully."),
    ).toBeTruthy();
    expect(syncMetadata).toHaveBeenCalledWith("ds-1");
  });

  it("shows Sync already running on 409", async () => {
    mockCatalog();
    getMetadataSyncStatus.mockResolvedValue(pendingSync);
    syncMetadata.mockRejectedValue(
      new ApiError("Metadata synchronization is already running", 409),
    );
    const user = userEvent.setup();
    renderWithQuery(<DataSourceExplorer dataSourceId="ds-1" />);
    await screen.findByText("Metadata has not been synchronized yet");
    await user.click(
      screen.getByRole("button", { name: "Synchronize metadata" }),
    );
    expect(await screen.findByText("Sync already running")).toBeTruthy();
  });

  it("does not render internal sync error_message content", async () => {
    const failedSyncWithToolError = {
      status: "FAILED",
      started_at: "2026-08-18T10:01:00Z",
      completed_at: "2026-08-18T10:02:00Z",
      schemas: 2,
      tables: 2,
      columns: 3,
      relationships: 1,
      error_message: "postgres.list_schemas tool failed",
    };

    getDataSource.mockResolvedValue(source);
    getMetadataSyncStatus.mockResolvedValue(failedSyncWithToolError);
    listSchemas.mockResolvedValue(page([publicSchema, reportingSchema]));
    listTables.mockResolvedValue(page([customers, orders]));
    listColumns.mockResolvedValue(page(columns));
    listRelationships.mockResolvedValue(page([relationship, compositeRelationship]));
    searchMetadata.mockResolvedValue({
      items: [],
      total: 0,
      limit: 50,
      truncated: false,
    });

    const user = userEvent.setup();
    renderWithQuery(<DataSourceExplorer dataSourceId="ds-1" />);

    expect(await screen.findByText("Limited data access")).toBeTruthy();
    expect(
      await screen.findByText(
        "Some metadata may be out of date. Try synchronizing metadata again to update this catalog.",
      ),
    ).toBeTruthy();
    expect(screen.queryByText(/list_schemas/i)).toBeNull();

    await user.click(await screen.findByRole("button", { name: /public/i }));
    expect(await screen.findByText(/public\.customers/i)).toBeTruthy();
  });

  it("shows schema loading, empty, and error states", async () => {
    getDataSource.mockResolvedValue(source);
    getMetadataSyncStatus.mockResolvedValue(successSync);
    listSchemas.mockReturnValue(new Promise(() => undefined));
    const loading = renderWithQuery(<DataSourceExplorer dataSourceId="ds-1" />);
    expect(await screen.findByText("Loading schemas")).toBeTruthy();
    loading.unmount();

    listSchemas.mockResolvedValue(page([]));
    renderWithQuery(<DataSourceExplorer dataSourceId="ds-1" />);
    expect(await screen.findByText("No schemas found.")).toBeTruthy();
  });

  it("shows a schema load error", async () => {
    getDataSource.mockResolvedValue(source);
    getMetadataSyncStatus.mockResolvedValue(successSync);
    listSchemas.mockRejectedValue(new ApiError("Unable to load metadata", 500));
    renderWithQuery(<DataSourceExplorer dataSourceId="ds-1" />);
    expect(await screen.findByText("Unable to load metadata")).toBeTruthy();
  });

  it("lets members browse, search, and sample without sync", async () => {
    permissions = ["data_source:read"];
    mockCatalog();
    const user = userEvent.setup();
    renderWithQuery(<DataSourceExplorer dataSourceId="ds-1" />);
    expect(
      await screen.findByRole("heading", { name: "Analytics" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Synchronize metadata" }),
    ).toBeNull();
    await user.click(await screen.findByRole("button", { name: /public/i }));
    await user.click(screen.getByRole("button", { name: /public.orders/i }));
    await user.click(screen.getByRole("tab", { name: "Data preview" }));
    await user.click(screen.getByRole("button", { name: "Preview sample" }));
    expect(
      await screen.findByText("Showing 1 of up to 10 sample rows."),
    ).toBeTruthy();
  });

  it("hides sync without permission and tells members to wait", async () => {
    permissions = ["data_source:read"];
    getDataSource.mockResolvedValue(source);
    getMetadataSyncStatus.mockResolvedValue(pendingSync);
    renderWithQuery(<DataSourceExplorer dataSourceId="ds-1" />);
    expect(
      await screen.findByText("Metadata has not been synchronized yet"),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "A workspace admin must synchronize metadata before you can browse this catalog.",
      ),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Synchronize metadata" }),
    ).toBeNull();
    expect(listSchemas).not.toHaveBeenCalled();
  });

  it("blocks users without read permission", () => {
    permissions = [];
    mockCatalog();
    renderWithQuery(<DataSourceExplorer dataSourceId="ds-1" />);
    expect(
      screen.getByText("You do not have permission to do that."),
    ).toBeTruthy();
    expect(listSchemas).not.toHaveBeenCalled();
  });

  it("disables metadata sync and sample for unsupported connectors", async () => {
    mockCatalog();
    getDataSource.mockResolvedValue({ ...source, type: "MYSQL" });
    renderWithQuery(<DataSourceExplorer dataSourceId="ds-1" />);
    expect(
      await screen.findByText("Metadata sync is not supported yet"),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Synchronize metadata" }),
    ).toBeNull();
    expect(listSchemas).not.toHaveBeenCalled();
    expect(getSampleData).not.toHaveBeenCalled();
  });

  it("hides explorer state when the workspace changes", async () => {
    mockCatalog();
    const view = renderWithQuery(<DataSourceExplorer dataSourceId="ds-1" />);
    expect(
      await screen.findByRole("heading", { name: "Analytics" }),
    ).toBeTruthy();
    workspaceId = "ws-2";
    view.rerender(<DataSourceExplorer dataSourceId="ds-1" />);
    expect(await screen.findByText("Data source not found.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /public/i })).toBeNull();
  });

  it("navigates from truncated search results", async () => {
    mockCatalog();
    searchMetadata.mockResolvedValue({
      items: [
        {
          metadata_type: "COLUMN",
          schema_name: "public",
          table_name: "customers",
          column_name: "email",
          description: null,
        },
      ],
      total: 1,
      limit: 50,
      truncated: true,
    });
    const user = userEvent.setup();
    renderWithQuery(<DataSourceExplorer dataSourceId="ds-1" />);
    await screen.findByRole("button", { name: /public/i });
    await user.type(
      screen.getByLabelText("Search schemas, tables, and columns"),
      "email",
    );
    expect(
      await screen.findByText("More results exist. Refine your search."),
    ).toBeTruthy();
    await user.click(
      screen.getByRole("option", { name: /public.customers.email/i }),
    );
    expect(await screen.findAllByText("email")).not.toHaveLength(0);
  });
});
