import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { renderWithQuery } from "@/test/render";

const mutateAsync = vi.fn();

vi.mock("@/features/auth/hooks/use-auth-mutations", () => ({
  useForgotPassword: () => ({ mutateAsync }),
}));

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
  });

  it("shows a generic success message", async () => {
    mutateAsync.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderWithQuery(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    await waitFor(() => {
      expect(
        screen.getByText("If the account exists, a reset email was sent."),
      ).toBeTruthy();
    });
  });
});
