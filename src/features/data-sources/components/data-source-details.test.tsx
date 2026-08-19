import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DataSourceDetails } from "@/features/data-sources/components/data-source-details";
import { ApiError } from "@/lib/api/errors";
import { renderWithQuery } from "@/test/render";
import type { Permission } from "@/types/common";

const getDataSource = vi.fn();
const updateDataSource = vi.fn();
const deleteDataSource = vi.fn();
const testDataSourceConnection = vi.fn();
const replace = vi.fn();
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
  useParams: () => ({ id: "ds-1" }),
}));

vi.mock("@/features/auth/hooks/use-auth", () => ({
  useAuth: () => ({
    workspace: { id: "ws-1", name: "Main" },
    can: (permission: Permission) => permissions.includes(permission),
  }),
}));

vi.mock("@/features/data-sources/api", () => ({
  getDataSource: (...args: unknown[]) => getDataSource(...args),
  updateDataSource: (...args: unknown[]) => updateDataSource(...args),
  deleteDataSource: (...args: unknown[]) => deleteDataSource(...args),
  testDataSourceConnection: (...args: unknown[]) =>
    testDataSourceConnection(...args),
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

describe("DataSourceDetails", () => {
  beforeEach(() => {
    getDataSource.mockReset();
    updateDataSource.mockReset();
    deleteDataSource.mockReset();
    testDataSourceConnection.mockReset();
    replace.mockReset();
    permissions = [
      "data_source:read",
      "data_source:create",
      "data_source:update",
      "data_source:delete",
      "data_source:test",
    ];
  });

  it("shows details without secrets", async () => {
    getDataSource.mockResolvedValue(source);
    renderWithQuery(<DataSourceDetails dataSourceId="ds-1" />);
    expect(
      await screen.findByRole("heading", { name: "Analytics" }),
    ).toBeTruthy();
    expect(screen.getAllByText("PostgreSQL").length).toBeGreaterThan(0);
    expect(screen.getByText("Not tested")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Explore schema" })).toBeTruthy();
    expect(screen.queryByText("password")).toBeNull();
  });

  it("renames a data source", async () => {
    getDataSource.mockResolvedValue(source);
    updateDataSource.mockResolvedValue({ ...source, name: "Warehouse" });
    const user = userEvent.setup();
    renderWithQuery(<DataSourceDetails dataSourceId="ds-1" />);
    await screen.findByRole("heading", { name: "Analytics" });
    const nameField = screen.getByLabelText("Name");
    await user.clear(nameField);
    await user.type(nameField, "Warehouse");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() =>
      expect(updateDataSource).toHaveBeenCalledWith("ds-1", {
        name: "Warehouse",
      }),
    );
    expect(
      await screen.findByText("Data source updated successfully."),
    ).toBeTruthy();
  });

  it("shows an update API failure", async () => {
    getDataSource.mockResolvedValue(source);
    updateDataSource.mockRejectedValue(
      new ApiError("Unable to save data source", 409),
    );
    const user = userEvent.setup();
    renderWithQuery(<DataSourceDetails dataSourceId="ds-1" />);
    await screen.findByRole("heading", { name: "Analytics" });
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(await screen.findByText("Unable to save data source")).toBeTruthy();
  });

  it("shows a test connection success from the API result", async () => {
    getDataSource.mockResolvedValue(source);
    testDataSourceConnection.mockResolvedValue({
      success: true,
      message: "Connection successful.",
    });
    const user = userEvent.setup();
    renderWithQuery(<DataSourceDetails dataSourceId="ds-1" />);
    await screen.findByRole("heading", { name: "Analytics" });
    await user.click(screen.getByRole("button", { name: "Test connection" }));
    expect(await screen.findByText("Connection successful.")).toBeTruthy();
  });

  it("treats 403 and 404 as not found", async () => {
    getDataSource.mockRejectedValue(new ApiError("Not authorized", 403));
    renderWithQuery(<DataSourceDetails dataSourceId="ds-1" />);
    expect(await screen.findByText("Data source not found.")).toBeTruthy();
    expect(screen.queryByText("Analytics")).toBeNull();
  });

  it("shows a test connection failure from the API result", async () => {
    getDataSource.mockResolvedValue(source);
    testDataSourceConnection.mockResolvedValue({
      success: false,
      message: "Unable to connect to the data source.",
    });
    const user = userEvent.setup();
    renderWithQuery(<DataSourceDetails dataSourceId="ds-1" />);
    await screen.findByRole("heading", { name: "Analytics" });
    await user.click(screen.getByRole("button", { name: "Test connection" }));
    expect(
      await screen.findByText("Unable to connect to the data source."),
    ).toBeTruthy();
  });

  it("hides edit and delete actions without permission", async () => {
    permissions = ["data_source:read", "data_source:test"];
    getDataSource.mockResolvedValue(source);
    renderWithQuery(<DataSourceDetails dataSourceId="ds-1" />);
    await screen.findByRole("heading", { name: "Analytics" });
    expect(screen.queryByRole("button", { name: "Save changes" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();
    expect(
      screen.getByRole("button", { name: "Test connection" }),
    ).toBeTruthy();
  });
});
