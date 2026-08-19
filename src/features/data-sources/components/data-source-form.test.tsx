import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DataSourceForm } from "@/features/data-sources/components/data-source-form";
import { ApiError } from "@/lib/api/errors";
import { renderWithQuery } from "@/test/render";
import type { Permission } from "@/types/common";

const createDataSource = vi.fn();
const replace = vi.fn();
let permissions: Permission[] = ["data_source:create"];

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
}));

vi.mock("@/features/auth/hooks/use-auth", () => ({
  useAuth: () => ({
    workspace: { id: "ws-1", name: "Main" },
    can: (permission: Permission) => permissions.includes(permission),
  }),
}));

vi.mock("@/features/data-sources/api", () => ({
  createDataSource: (...args: unknown[]) => createDataSource(...args),
}));

describe("DataSourceForm", () => {
  beforeEach(() => {
    createDataSource.mockReset();
    replace.mockReset();
    permissions = ["data_source:create"];
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();
    renderWithQuery(<DataSourceForm />);
    await user.clear(screen.getByLabelText("Port"));
    await user.click(screen.getByRole("button", { name: "Save data source" }));

    expect(await screen.findByText("Name is required.")).toBeTruthy();
    expect(screen.getByText("Host is required.")).toBeTruthy();
    expect(screen.getByText("Port is required.")).toBeTruthy();
    expect(screen.getByText("Database is required.")).toBeTruthy();
    expect(screen.getByText("Username is required.")).toBeTruthy();
    expect(screen.getByText("Password is required.")).toBeTruthy();
    expect(createDataSource).not.toHaveBeenCalled();
  });

  it("creates a data source and redirects", async () => {
    createDataSource.mockResolvedValue({
      id: "ds-1",
      workspace_id: "ws-1",
      name: "Analytics",
    });
    const user = userEvent.setup();
    renderWithQuery(<DataSourceForm />);

    await user.type(screen.getByLabelText("Name"), "Analytics");
    await user.type(screen.getByLabelText("Host"), "db.example.com");
    await user.type(screen.getByLabelText("Database"), "analytics");
    await user.type(screen.getByLabelText("Username"), "reader");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: "Save data source" }));

    await waitFor(() =>
      expect(createDataSource).toHaveBeenCalledWith({
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
    );
    expect(replace).toHaveBeenCalledWith("/data-sources/ds-1?created=1");
  });

  it("shows an API failure", async () => {
    createDataSource.mockRejectedValue(
      new ApiError("Unable to save data source", 409),
    );
    const user = userEvent.setup();
    renderWithQuery(<DataSourceForm />);
    await user.type(screen.getByLabelText("Name"), "Analytics");
    await user.type(screen.getByLabelText("Host"), "db.example.com");
    await user.type(screen.getByLabelText("Database"), "analytics");
    await user.type(screen.getByLabelText("Username"), "reader");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: "Save data source" }));

    expect(await screen.findByText("Unable to save data source")).toBeTruthy();
    expect((screen.getByLabelText("Host") as HTMLInputElement).value).toBe(
      "db.example.com",
    );
  });

  it("hides the form when the user cannot create", () => {
    permissions = ["data_source:read"];
    renderWithQuery(<DataSourceForm />);
    expect(
      screen.getByText(
        "You do not have permission to add a data source in this workspace.",
      ),
    ).toBeTruthy();
    expect(screen.queryByLabelText("Host")).toBeNull();
  });
});
