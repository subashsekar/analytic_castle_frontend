import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/features/auth/components/login-form";
import { ApiError } from "@/lib/api/errors";
import { renderWithQuery } from "@/test/render";

const replace = vi.fn();
const mutateAsync = vi.fn();
let loginError: unknown = null;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/features/auth/hooks/use-auth-mutations", () => ({
  useLogin: () => ({ mutateAsync, error: loginError }),
}));

vi.mock("@/features/auth/api", () => ({
  composeMe: vi.fn(async (user: { id: string; email: string }) => ({
    user: {
      ...user,
      full_name: "Ada Lovelace",
      first_name: "Ada",
      last_name: "Lovelace",
      role: "USER",
      email_verified: true,
      is_active: true,
      is_super_admin: false,
    },
    organization: { id: "org-1", name: "Acme", role: "OWNER" },
    workspace: { id: "ws-1", name: "Main", organization_id: "org-1" },
    organizations: [{ id: "org-1", name: "Acme", role: "OWNER" }],
    workspaces: [{ id: "ws-1", name: "Main", organization_id: "org-1" }],
    workspace_role: "OWNER",
    permissions: [],
  })),
  getCurrentUser: vi.fn(),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    replace.mockReset();
    mutateAsync.mockReset();
    loginError = null;
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();
    renderWithQuery(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Email is required.")).toBeTruthy();
    expect(screen.getByText("Password is required.")).toBeTruthy();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("signs in and redirects when login succeeds", async () => {
    mutateAsync.mockResolvedValue({
      access_token: "access",
      refresh_token: "refresh",
      user: {
        id: "1",
        email: "ada@example.com",
        first_name: "Ada",
        last_name: "Lovelace",
        role: "USER",
        email_verified: true,
        is_active: true,
        is_super_admin: false,
        full_name: "Ada Lovelace",
      },
    });

    const user = userEvent.setup();
    renderWithQuery(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "SecurePassword123!");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        email: "ada@example.com",
        password: "SecurePassword123!",
      });
      expect(replace).toHaveBeenCalledWith("/home");
    });
  });

  it("shows invalid credentials on 401", async () => {
    const failure = new ApiError("nope", 401);
    loginError = failure;
    mutateAsync.mockRejectedValue(failure);

    const user = userEvent.setup();
    renderWithQuery(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "SecurePassword123!");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Invalid email or password.",
    );
    expect(replace).not.toHaveBeenCalled();
  });
});
