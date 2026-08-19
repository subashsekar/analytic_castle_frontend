import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VerifyEmailPanel } from "@/features/auth/components/verify-email-panel";
import { renderWithQuery } from "@/test/render";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams("token=verify-token"),
}));

vi.mock("@/features/auth/api", () => ({
  verifyEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/features/auth/hooks/use-auth-mutations", () => ({
  useResendVerification: () => ({ mutateAsync: vi.fn() }),
}));

describe("VerifyEmailPanel", () => {
  it("verifies the token from the URL", async () => {
    renderWithQuery(<VerifyEmailPanel />);

    await waitFor(() => {
      expect(screen.getByText(/email is verified/i)).toBeTruthy();
    });
  });
});
