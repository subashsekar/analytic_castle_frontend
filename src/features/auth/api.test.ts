import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api/client";
import { authPaths } from "@/lib/api/paths";
import {
  getCurrentUser,
  login,
  logoutRequest,
  register,
} from "@/features/auth/api";
import { setSession } from "@/lib/auth/session";

vi.mock("@/lib/api/client", () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock("@/features/workspace/api", () => ({
  listOrganizations: vi.fn().mockResolvedValue([
    { id: "org", name: "Acme", slug: "acme" },
  ]),
  listWorkspaces: vi.fn().mockResolvedValue([
    { id: "ws", name: "Main", organization_id: "org" },
  ]),
}));

vi.mock("@/features/team/api", () => ({
  listWorkspaceMembers: vi.fn().mockResolvedValue([
    {
      id: "m1",
      workspace_id: "ws",
      user_id: "1",
      email: "ada@example.com",
      first_name: "Ada",
      last_name: "Lovelace",
      full_name: "Ada Lovelace",
      role: "OWNER",
      created_at: null,
    },
  ]),
}));

const mockedApi = api as unknown as {
  post: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
};

describe("auth API", () => {
  beforeEach(() => {
    mockedApi.post.mockReset();
    mockedApi.get.mockReset();
  });

  it("logs in and returns the token envelope", async () => {
    mockedApi.post.mockResolvedValue({
      data: {
        access_token: "access",
        refresh_token: "refresh",
        token_type: "bearer",
        user: {
          id: "1",
          email: "ada@example.com",
          first_name: "Ada",
          last_name: "Lovelace",
          role: "USER",
          is_verified: true,
          is_active: true,
        },
      },
    });

    const result = await login({
      email: "ada@example.com",
      password: "SecurePassword123!",
    });

    expect(mockedApi.post).toHaveBeenCalledWith(authPaths.login, {
      email: "ada@example.com",
      password: "SecurePassword123!",
    });
    expect(result.access_token).toBe("access");
    expect(result.user?.first_name).toBe("Ada");
  });

  it("registers with first_name and last_name", async () => {
    mockedApi.post.mockResolvedValue({
      data: {
        id: "1",
        email: "ada@example.com",
        first_name: "Ada",
        last_name: "Lovelace",
        role: "USER",
        is_verified: false,
        is_active: true,
      },
    });

    const result = await register({
      email: "ada@example.com",
      password: "SecurePassword123!",
      first_name: "Ada",
      last_name: "Lovelace",
    });

    expect(mockedApi.post).toHaveBeenCalledWith(authPaths.register, {
      email: "ada@example.com",
      password: "SecurePassword123!",
      first_name: "Ada",
      last_name: "Lovelace",
    });
    expect(result.user.email).toBe("ada@example.com");
    expect(result.user.first_name).toBe("Ada");
  });

  it("loads the current user from /api/v1/auth/me and composes orgs/workspaces", async () => {
    mockedApi.get.mockResolvedValue({
      data: {
        id: "1",
        email: "ada@example.com",
        first_name: "Ada",
        last_name: "Lovelace",
        role: "USER",
        is_verified: true,
        is_active: true,
      },
    });

    const me = await getCurrentUser();
    expect(mockedApi.get).toHaveBeenCalledWith(authPaths.me);
    expect(me.user.email_verified).toBe(true);
    expect(me.organization?.id).toBe("org");
    expect(me.workspaces).toHaveLength(1);
    expect(me.workspace_role).toBe("OWNER");
  });

  it("logs out with the refresh token", async () => {
    setSession({ access_token: "access", refresh_token: "refresh" });
    mockedApi.post.mockResolvedValue({ data: { detail: "ok" } });
    await logoutRequest();
    expect(mockedApi.post).toHaveBeenCalledWith(
      authPaths.logout,
      { refresh_token: "refresh" },
      { skipAuthRefresh: true },
    );
  });
});
