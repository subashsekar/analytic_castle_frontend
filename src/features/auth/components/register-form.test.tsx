import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterForm } from "@/features/auth/components/register-form";
import { renderWithQuery } from "@/test/render";

const replace = vi.fn();
const mutateAsync = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("@/features/auth/hooks/use-auth-mutations", () => ({
  useRegister: () => ({ mutateAsync, error: null }),
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    replace.mockReset();
    mutateAsync.mockReset();
  });

  it("validates required name fields", async () => {
    const user = userEvent.setup();
    renderWithQuery(<RegisterForm />);

    await user.type(screen.getByLabelText("Work email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "SecurePassword123!");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("First name is required.")).toBeTruthy();
    expect(screen.getByText("Last name is required.")).toBeTruthy();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("registers and sends the user to email verification", async () => {
    mutateAsync.mockResolvedValue({
      user: {
        id: "1",
        email: "ada@example.com",
        first_name: "Ada",
        last_name: "Lovelace",
      },
    });

    const user = userEvent.setup();
    renderWithQuery(<RegisterForm />);

    await user.type(screen.getByLabelText("First name"), "Ada");
    await user.type(screen.getByLabelText("Last name"), "Lovelace");
    await user.type(screen.getByLabelText("Work email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "SecurePassword123!");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        first_name: "Ada",
        last_name: "Lovelace",
        email: "ada@example.com",
        password: "SecurePassword123!",
      });
      expect(replace).toHaveBeenCalledWith(
        "/verify-email?email=ada%40example.com",
      );
    });
  });
});
