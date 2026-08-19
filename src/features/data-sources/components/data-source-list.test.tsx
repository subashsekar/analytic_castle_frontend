import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DataSourceList } from "@/features/data-sources/components/data-source-list";
import { ApiError } from "@/lib/api/errors";
import { renderWithQuery } from "@/test/render";
import type { Permission } from "@/types/common";

const listDataSources = vi.fn();
const testDataSourceConnection = vi.fn();
const deleteDataSource = vi.fn();
const replace = vi.fn();

let workspaceId = "ws-1";
let permissions: Permission[] = [
  "data_source:read",
  "data_source:create",
  "data_source:update",
  "data_source:delete",
  "data_source:test",
];

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/features/auth/hooks/use-auth", () => ({
  useAuth: () => ({
    workspace: {
      id: workspaceId,
      name: workspaceId === "ws-1" ? "Main" : "Finance",
    },
    can: (permission: Permission) => permissions.includes(permission),
  }),
}));

vi.mock("@/features/data-sources/api", () => ({
  listDataSources: (...args: unknown[]) => listDataSources(...args),
  testDataSourceConnection: (...args: unknown[]) =>
    testDataSourceConnection(...args),
  deleteDataSource: (...args: unknown[]) => deleteDataSource(...args),
}));

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

describe("DataSourceList", () => {
  beforeEach(() => {
    listDataSources.mockReset();
    testDataSourceConnection.mockReset();
    deleteDataSource.mockReset();
    workspaceId = "ws-1";
    permissions = [
      "data_source:read",
      "data_source:create",
      "data_source:update",
      "data_source:delete",
      "data_source:test",
    ];
  });

  it("shows a loading state", () => {
    listDataSources.mockReturnValue(new Promise(() => undefined));
    renderWithQuery(<DataSourceList />);
    expect(screen.getByText("Loading data sources")).toBeTruthy();
  });

  it("shows the empty state with an add action", async () => {
    listDataSources.mockResolvedValue([]);
    renderWithQuery(<DataSourceList />);
    expect(
      await screen.findByText("No data sources have been added"),
    ).toBeTruthy();
    expect(screen.getAllByText("Add data source").length).toBeGreaterThan(0);
  });

  it("renders data sources after a successful load", async () => {
    listDataSources.mockResolvedValue([source]);
    renderWithQuery(<DataSourceList />);
    expect(await screen.findByText("Analytics")).toBeTruthy();
    expect(screen.getByText("PostgreSQL")).toBeTruthy();
    expect(screen.getByText("Not tested")).toBeTruthy();
    expect(screen.queryByText("secret")).toBeNull();
  });

  it("shows an API error", async () => {
    listDataSources.mockRejectedValue(new ApiError("Boom", 500));
    renderWithQuery(<DataSourceList />);
    expect(
      await screen.findByText("Data sources could not be loaded."),
    ).toBeTruthy();
  });

  it("hides unauthorized actions for members", async () => {
    permissions = ["data_source:read", "data_source:test"];
    listDataSources.mockResolvedValue([source]);
    renderWithQuery(<DataSourceList />);
    expect(await screen.findByText("Analytics")).toBeTruthy();
    expect(screen.queryByText("Add data source")).toBeNull();
    expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();
    expect(screen.getByRole("button", { name: "Test" })).toBeTruthy();
  });

  it("loads the active workspace and updates after a switch", async () => {
    listDataSources.mockImplementation(async (id: string) =>
      id === "ws-1"
        ? [source]
        : [{ ...source, id: "ds-2", workspace_id: "ws-2", name: "Finance DB" }],
    );

    const view = renderWithQuery(<DataSourceList />);
    expect(await screen.findByText("Analytics")).toBeTruthy();
    expect(listDataSources).toHaveBeenCalledWith("ws-1");

    workspaceId = "ws-2";
    view.rerender(<DataSourceList />);
    expect(await screen.findByText("Finance DB")).toBeTruthy();
    expect(screen.queryByText("Analytics")).toBeNull();
    expect(listDataSources).toHaveBeenCalledWith("ws-2");
  });

  it("tests a connection and shows success", async () => {
    listDataSources.mockResolvedValue([source]);
    testDataSourceConnection.mockResolvedValue({
      success: true,
      message: "Connection successful.",
    });
    const user = userEvent.setup();
    renderWithQuery(<DataSourceList />);
    await screen.findByText("Analytics");
    await user.click(screen.getByRole("button", { name: "Test" }));
    expect(await screen.findByText("Connection successful.")).toBeTruthy();
  });

  it("shows a rate-limit error when testing a connection", async () => {
    listDataSources.mockResolvedValue([source]);
    testDataSourceConnection.mockRejectedValue(
      new ApiError("Too many requests", 429, { retryAfter: 5 }),
    );
    const user = userEvent.setup();
    renderWithQuery(<DataSourceList />);
    await screen.findByText("Analytics");
    await user.click(screen.getByRole("button", { name: "Test" }));
    expect(
      await screen.findByText("Too many requests. Try again in 5 seconds."),
    ).toBeTruthy();
  });

  it("tests a connection and shows failure", async () => {
    listDataSources.mockResolvedValue([source]);
    testDataSourceConnection.mockResolvedValue({
      success: false,
      message: "Unable to connect to the data source.",
    });
    const user = userEvent.setup();
    renderWithQuery(<DataSourceList />);
    await screen.findByText("Analytics");
    await user.click(screen.getByRole("button", { name: "Test" }));
    expect(
      await screen.findByText("Unable to connect to the data source."),
    ).toBeTruthy();
  });

  it("confirms deletion and removes the data source", async () => {
    listDataSources.mockResolvedValue([source]);
    deleteDataSource.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderWithQuery(<DataSourceList />);
    await screen.findByText("Analytics");
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByText('Delete "Analytics"?')).toBeTruthy();
    const confirm = screen.getAllByRole("button", { name: "Delete" }).at(-1);
    await user.click(confirm!);
    await waitFor(() => expect(deleteDataSource).toHaveBeenCalledWith("ds-1"));
    expect(
      await screen.findByText("Data source deleted successfully."),
    ).toBeTruthy();
  });

  it("shows a delete API error", async () => {
    listDataSources.mockResolvedValue([source]);
    deleteDataSource.mockRejectedValue(
      new ApiError("Unable to delete data source", 409),
    );
    const user = userEvent.setup();
    renderWithQuery(<DataSourceList />);
    await screen.findByText("Analytics");
    await user.click(screen.getByRole("button", { name: "Delete" }));
    const confirm = screen.getAllByRole("button", { name: "Delete" }).at(-1);
    await user.click(confirm!);
    expect(
      await screen.findByText("Unable to delete data source"),
    ).toBeTruthy();
  });
});
