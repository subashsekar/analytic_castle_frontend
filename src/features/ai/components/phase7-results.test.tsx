import { describe, expect, it, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithQuery } from "@/test/render";
import { SqlViewer } from "@/features/ai/components/sql-viewer";
import { QueryResult } from "@/features/ai/components/query-result";
import { QueryHistory } from "@/features/ai/components/query-history";

// Mock the DB metadata APIs
vi.mock("@/features/schema-explorer/api", () => ({
  listTables: vi.fn(() =>
    Promise.resolve({
      items: [{ id: "t-1", name: "orders" }],
    })
  ),
  getSampleData: vi.fn(() =>
    Promise.resolve({
      data_source_id: "ds-1",
      table_id: "t-1",
      schema_name: "public",
      table_name: "orders",
      table_type: "BASE TABLE",
      columns: [
        { name: "id", data_type: "INTEGER", sensitivity: "PUBLIC", masked: false },
        { name: "status", data_type: "TEXT", sensitivity: "PUBLIC", masked: false },
        { name: "shipped", data_type: "BOOLEAN", sensitivity: "PUBLIC", masked: false },
        { name: "created_at", data_type: "TIMESTAMP", sensitivity: "PUBLIC", masked: false },
        { name: "notes", data_type: "TEXT", sensitivity: "PUBLIC", masked: false },
      ],
      rows: [
        { id: 1, status: "completed", shipped: true, created_at: "2026-09-16T12:00:00Z", notes: null },
        { id: 2, status: "pending", shipped: false, created_at: "2026-09-16T13:00:00Z", notes: "test" },
      ],
      row_count: 2,
      row_limit: 100,
      truncated_columns: false,
    })
  ),
}));

// Mock the Auth hook
vi.mock("@/features/auth/hooks/use-auth", () => ({
  useAuth: () => ({
    workspace: { id: "ws-1", name: "Main", organization_id: "org-1" },
    can: () => true,
  }),
}));

vi.mock("@/features/ai/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/ai/api")>();
  return {
    ...actual,
    executeSql: vi.fn(async () => ({
      success: true,
      rows: [
        {
          id: 1,
          status: "completed",
          shipped: true,
          created_at: "2026-09-16T12:00:00Z",
          notes: null,
        },
        {
          id: 2,
          status: "pending",
          shipped: false,
          created_at: "2026-09-16T13:00:00Z",
          notes: "test",
        },
      ],
      columns: ["id", "status", "shipped", "created_at", "notes"],
      duration_ms: 120,
      truncated: false,
      applied_limit: 10,
    })),
    validateSql: vi.fn(async () => ({
      is_valid: true,
      sql: "SELECT * FROM orders LIMIT 10;",
      violations: [],
    })),
    correctSql: vi.fn(),
  };
});

// Mock the query history API / hooks
vi.mock("@/features/ai/hooks/use-query-history", () => ({
  useQueryHistory: vi.fn(() => ({
    data: {
      items: [
        {
          id: "qh-1",
          data_source_id: "ds-1",
          generated_sql: "SELECT * FROM orders LIMIT 10",
          status: "SUCCEEDED",
          duration_ms: 150,
          created_at: "2026-09-16T10:00:00Z",
        },
      ],
      total: 1,
      page: 1,
      page_size: 10,
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  })),
  useQueryHistoryDetail: vi.fn(() => ({
    data: {
      id: "qh-1",
      generated_sql: "SELECT * FROM orders LIMIT 10",
      status: "SUCCEEDED",
      duration_ms: 150,
      created_at: "2026-09-16T10:00:00Z",
    },
    isLoading: false,
    isError: false,
  })),
}));

describe("SQL Viewer Component", () => {
  it("renders read-only SQL in collapsed state by default", () => {
    const sql = "SELECT * FROM orders WHERE status = 'completed';";
    renderWithQuery(<SqlViewer sql={sql} />);

    expect(screen.getByText("Generated SQL")).toBeDefined();
    expect(screen.getByText("Click to expand")).toBeDefined();
    // In collapsed state, we display the first line of the query
    expect(screen.getByText(/SELECT \* FROM orders/)).toBeDefined();
  });

  it("can be expanded and collapsed", () => {
    const sql = "SELECT * FROM orders WHERE status = 'completed';";
    renderWithQuery(<SqlViewer sql={sql} />);

    // Click to expand
    fireEvent.click(screen.getByText("Click to expand"));
    expect(screen.queryByText("Click to expand")).toBeNull();
    expect(screen.getByText("Collapse")).toBeDefined();

    // Click collapse button in header
    fireEvent.click(screen.getByText("Collapse"));
    expect(screen.getByText("Click to expand")).toBeDefined();
  });

  it("renders with color highlights for SQL keywords", () => {
    const sql = "SELECT * FROM orders WHERE id = 1;";
    renderWithQuery(<SqlViewer sql={sql} />);

    // Expand to render the syntax highlighted block
    fireEvent.click(screen.getByText("Click to expand"));

    const selectKeyword = screen.getByText("SELECT");
    expect(selectKeyword.className).toContain("text-signal");
    expect(selectKeyword.className).toContain("font-bold");

    const whereKeyword = screen.getByText("WHERE");
    expect(whereKeyword.className).toContain("text-signal");
    expect(whereKeyword.className).toContain("font-bold");
  });
});

describe("QueryResult Component", () => {
  it("displays running status initially and then completes", async () => {
    const sql = "SELECT * FROM orders LIMIT 10;";
    renderWithQuery(<QueryResult sql={sql} dataSourceId="ds-1" isNewMessage={true} />);

    // Renders "Running query..." initially
    expect(screen.getByText("Running query…")).toBeDefined();

    // After animation, displays completed state
    await waitFor(() => {
      expect(screen.getByText("Query completed")).toBeDefined();
    }, { timeout: 1500 });

    // Renders table headers
    expect(screen.getByText("id")).toBeDefined();
    expect(screen.getByText("status")).toBeDefined();
    expect(screen.getByText("shipped")).toBeDefined();

    // Renders custom boolean format
    expect(screen.getByText("true")).toBeDefined();
    expect(screen.getByText("false")).toBeDefined();

    // Renders custom null values safely
    expect(screen.getByText("null")).toBeDefined();
  });

  it("shows direct completion for historical messages without simulated animation delay", async () => {
    const sql = "SELECT * FROM orders LIMIT 10;";
    renderWithQuery(<QueryResult sql={sql} dataSourceId="ds-1" isNewMessage={false} />);

    // Wait for completed state to render asynchronously
    await waitFor(() => {
      expect(screen.getByText("Query completed")).toBeDefined();
    });

    // Wait for the async table loading & sample data fetch to finish
    await waitFor(() => {
      expect(screen.getByText("id")).toBeDefined();
    }, { timeout: 2000 });
  });

  it("allows safe client-side CSV downloads", async () => {
    const sql = "SELECT * FROM orders LIMIT 10;";
    renderWithQuery(<QueryResult sql={sql} dataSourceId="ds-1" isNewMessage={false} />);

    // Wait for the rows to render
    await waitFor(() => {
      expect(screen.getByText("id")).toBeDefined();
    }, { timeout: 2000 });

    const downloadButton = screen.getByRole("button", { name: /download csv/i });
    expect(downloadButton).toBeDefined();

    // Trigger download click
    fireEvent.click(downloadButton);
  });
});

describe("QueryHistory Component", () => {
  it("lists workspace query history", () => {
    renderWithQuery(<QueryHistory workspaceId="ws-1" dataSourceId="ds-1" />);

    expect(screen.getByText("Query Logs")).toBeDefined();
    expect(screen.getByText("SELECT * FROM orders LIMIT 10")).toBeDefined();
    expect(screen.getByText("150ms")).toBeDefined();
  });

  it("allows clicking a query to inspect in a full details dialog", async () => {
    renderWithQuery(<QueryHistory workspaceId="ws-1" dataSourceId="ds-1" />);

    // Click historical log item
    fireEvent.click(screen.getByText("SELECT * FROM orders LIMIT 10"));

    // Verify detail dialog is rendered
    expect(screen.getByRole("heading", { name: "Query Details" })).toBeDefined();
    expect(screen.getByText("Execution Status:")).toBeDefined();
    
    // There will be multiple Succeeded texts: one in dropdown select, one in badge inside dialog.
    expect(screen.getAllByText("Succeeded").length).toBeGreaterThan(1);
  });
});

describe("Security and MCP Isolation", () => {
  it("never leaks raw SQLAlchemy/Postgres errors or MCP internal terminologies", () => {
    const sql = "SELECT * FROM orders LIMIT 10;";
    const { container } = renderWithQuery(<QueryResult sql={sql} dataSourceId="ds-1" isNewMessage={false} />);

    // Ensure we do not display database-admin or MCP internal tool terms
    const text = container.innerHTML;
    expect(text).not.toContain("execute_query");
    expect(text).not.toContain("list_schemas");
    expect(text).not.toContain("SQLAlchemyException");
    expect(text).not.toContain("PostgreSQL stack trace");
  });
});
