import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProfilePage from "@/app/(app)/profile/page";
import { ThemeProvider } from "@/providers/theme-provider";

vi.mock("@/features/auth/hooks/use-auth", () => ({
  useAuth: () => ({
    status: "authenticated",
    error: null,
    user: {
      id: "1",
      email: "ada@example.com",
      full_name: "Ada Lovelace",
      first_name: "Ada",
      last_name: "Lovelace",
      role: "USER",
      email_verified: true,
      is_active: true,
      is_super_admin: false,
    },
    me: {
      organization: { id: "org", name: "Acme", role: "ADMIN" },
      workspace_role: "ADMIN",
    },
  }),
}));

describe("profile", () => {
  it("shows the current user and a readable role", () => {
    render(
      <ThemeProvider>
        <ProfilePage />
      </ThemeProvider>,
    );

    expect(screen.getByText("Ada Lovelace")).toBeTruthy();
    expect(screen.getByText("ada@example.com")).toBeTruthy();
    expect(screen.getByText("Admin")).toBeTruthy();
    expect(screen.getByText("Verified")).toBeTruthy();
  });
});
