import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NewWorkspacePage from "@/app/(app)/workspace/new/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@/features/auth/hooks/use-auth", () => ({
  useAuth: () => ({ me: null }),
}));

vi.mock("@/features/workspace/hooks/use-workspaces", () => ({
  useCreateWorkspace: () => ({ mutateAsync: vi.fn() }),
}));

describe("workspace empty state", () => {
  it("prompts the user to create a first workspace", () => {
    render(<NewWorkspacePage />);
    expect(screen.getByText("No workspace yet")).toBeTruthy();
    expect(
      screen.getByText("Create your first workspace to continue."),
    ).toBeTruthy();
  });
});
