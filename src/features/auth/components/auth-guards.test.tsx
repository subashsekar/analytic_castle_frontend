import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  GuestGate,
  ProtectedGate,
} from "@/features/auth/components/auth-guards";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/home",
  useSearchParams: () => new URLSearchParams(),
}));

const authState = {
  status: "loading" as "loading" | "authenticated" | "unauthenticated",
  me: null as null | {
    user: { email_verified: boolean };
    workspaces: Array<{ id: string; name: string }>;
    workspace: { id: string; name: string } | null;
  },
  isVerified: false,
  error: null as Error | null,
};

vi.mock("@/features/auth/hooks/use-auth", () => ({
  useAuth: () => authState,
}));

describe("route guards", () => {
  beforeEach(() => {
    replace.mockReset();
    authState.status = "loading";
    authState.me = null;
    authState.isVerified = false;
    authState.error = null;
  });

  it("restores session before rendering protected content", () => {
    render(
      <ProtectedGate>
        <p>Secret</p>
      </ProtectedGate>,
    );

    expect(screen.getByText("Restoring session")).toBeTruthy();
    expect(screen.queryByText("Secret")).toBeNull();
  });

  it("redirects unauthenticated users to login", async () => {
    authState.status = "unauthenticated";

    render(
      <ProtectedGate>
        <p>Secret</p>
      </ProtectedGate>,
    );

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/login?next=%2Fhome");
    });
  });

  it("renders protected content for authenticated verified users", () => {
    authState.status = "authenticated";
    authState.isVerified = true;
    authState.me = {
      user: { email_verified: true },
      workspaces: [{ id: "ws", name: "Main" }],
      workspace: { id: "ws", name: "Main" },
    };

    render(
      <ProtectedGate>
        <p>Secret</p>
      </ProtectedGate>,
    );

    expect(screen.getByText("Secret")).toBeTruthy();
  });

  it("sends authenticated guests away from login", async () => {
    authState.status = "authenticated";
    authState.isVerified = true;
    authState.me = {
      user: { email_verified: true },
      workspaces: [{ id: "ws", name: "Main" }],
      workspace: { id: "ws", name: "Main" },
    };

    render(
      <GuestGate>
        <p>Login form</p>
      </GuestGate>,
    );

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/home");
    });
  });
});
