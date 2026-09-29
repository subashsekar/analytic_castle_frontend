import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrganizationPage } from "@/features/workspace/components/organization-page";
import { renderWithQuery } from "@/test/render";

const listOrganizations = vi.fn();
const createOrganization = vi.fn();

vi.mock("@/features/auth/hooks/use-auth", () => ({
  useAuth: () => ({
    me: {
      organization: { id: "org-1", name: "Acme", role: "OWNER" },
      organizations: [{ id: "org-1", name: "Acme", role: "OWNER" }],
    },
  }),
}));

vi.mock("@/features/workspace/api", () => ({
  listOrganizations: (...args: unknown[]) => listOrganizations(...args),
  createOrganization: (...args: unknown[]) => createOrganization(...args),
}));

describe("OrganizationPage", () => {
  beforeEach(() => {
    listOrganizations.mockReset();
    createOrganization.mockReset();
  });

  it("lists organizations from the API", async () => {
    listOrganizations.mockResolvedValue([
      { id: "org-1", name: "Acme", slug: "acme", role: "OWNER" },
    ]);

    renderWithQuery(<OrganizationPage />);

    expect(await screen.findByText("Acme")).toBeTruthy();
    expect(screen.getByText("acme")).toBeTruthy();
    expect(screen.getByText("Current")).toBeTruthy();
  });

  it("creates an organization and shows it in the list", async () => {
    listOrganizations.mockResolvedValueOnce([]);
    createOrganization.mockResolvedValue({
      id: "org-2",
      name: "Northwind",
      slug: "northwind",
    });
    listOrganizations.mockResolvedValue([
      { id: "org-2", name: "Northwind", slug: "northwind" },
    ]);

    renderWithQuery(<OrganizationPage />);

    expect(await screen.findByText("No organizations yet")).toBeTruthy();

    await userEvent.type(
      screen.getByLabelText("Organization name"),
      "Northwind",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Create organization" }),
    );

    await waitFor(() => {
      expect(createOrganization).toHaveBeenCalledWith({ name: "Northwind" });
    });
    expect(await screen.findByText("Northwind")).toBeTruthy();
    expect(screen.getByText("Organization created.")).toBeTruthy();
  });
});
