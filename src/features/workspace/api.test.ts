import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api/client";
import { organizationPaths, workspacePaths } from "@/lib/api/paths";
import {
  createOrganization,
  createWorkspace,
  listOrganizations,
  listWorkspaces,
} from "@/features/workspace/api";

vi.mock("@/lib/api/client", () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockedApi = api as unknown as {
  post: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
};

describe("workspace API", () => {
  beforeEach(() => {
    mockedApi.post.mockReset();
    mockedApi.get.mockReset();
  });

  it("lists workspaces for an organization", async () => {
    mockedApi.get.mockResolvedValue({
      data: [{ id: "ws-1", name: "Main", organization_id: "org-1" }],
    });

    await expect(listWorkspaces("org-1")).resolves.toEqual([
      {
        id: "ws-1",
        name: "Main",
        organization_id: "org-1",
        slug: null,
        is_default: undefined,
      },
    ]);
    expect(mockedApi.get).toHaveBeenCalledWith(workspacePaths.root, {
      params: { organization_id: "org-1" },
    });
  });

  it("creates a workspace", async () => {
    mockedApi.post.mockResolvedValue({
      data: { id: "ws-2", name: "Finance", organization_id: "org-1" },
    });

    await expect(
      createWorkspace({ organization_id: "org-1", name: "Finance" }),
    ).resolves.toMatchObject({
      id: "ws-2",
      name: "Finance",
    });
    expect(mockedApi.post).toHaveBeenCalledWith(workspacePaths.root, {
      organization_id: "org-1",
      name: "Finance",
    });
  });

  it("lists organizations", async () => {
    mockedApi.get.mockResolvedValue({
      data: [{ id: "org-1", name: "Acme", slug: "acme" }],
    });

    await expect(listOrganizations()).resolves.toEqual([
      {
        id: "org-1",
        name: "Acme",
        slug: "acme",
        role: null,
        plan_code: null,
      },
    ]);
    expect(mockedApi.get).toHaveBeenCalledWith(organizationPaths.root);
  });

  it("creates an organization", async () => {
    mockedApi.post.mockResolvedValue({
      data: { id: "org-2", name: "Northwind", slug: "northwind" },
    });

    await expect(createOrganization({ name: "Northwind" })).resolves.toMatchObject(
      {
        id: "org-2",
        name: "Northwind",
        slug: "northwind",
      },
    );
    expect(mockedApi.post).toHaveBeenCalledWith(organizationPaths.root, {
      name: "Northwind",
    });
  });
});
