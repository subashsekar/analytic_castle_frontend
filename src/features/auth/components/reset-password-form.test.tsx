import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { ApiError } from "@/lib/api/errors";
import { renderWithQuery } from "@/test/render";

const mutateAsync = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("token=reset-token"),
}));

vi.mock("@/features/auth/hooks/use-auth-mutations", () => ({
  useResetPassword: () => ({ mutateAsync }),
}));

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
  });

  it("resets the password with the URL token", async () => {
    mutateAsync.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderWithQuery(<ResetPasswordForm />);

    await user.type(screen.getByLabelText("New password"), "SecurePassword123!");
    await user.type(
      screen.getByLabelText("Confirm password"),
      "SecurePassword123!",
    );
    await user.click(screen.getByRole("button", { name: "Update password" }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        token: "reset-token",
        new_password: "SecurePassword123!",
      });
      expect(screen.getByText(/password has been updated/i)).toBeTruthy();
    });
  });

  it("shows an expired token state", async () => {
    mutateAsync.mockRejectedValue(new ApiError("Token has expired", 400));
    const user = userEvent.setup();
    renderWithQuery(<ResetPasswordForm />);

    await user.type(screen.getByLabelText("New password"), "SecurePassword123!");
    await user.type(
      screen.getByLabelText("Confirm password"),
      "SecurePassword123!",
    );
    await user.click(screen.getByRole("button", { name: "Update password" }));

    expect(await screen.findByText(/invalid or has expired/i)).toBeTruthy();
  });
});
