"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useResetPassword } from "@/features/auth/hooks/use-auth-mutations";
import { resetPasswordErrors } from "@/features/auth/schemas";
import { useForm } from "@/hooks/shared/use-form";
import { isExpiredTokenError } from "@/lib/api/errors";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/field";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const resetPassword = useResetPassword();
  const [success, setSuccess] = useState(false);
  const [expired, setExpired] = useState(false);

  const form = useForm({
    initialValues: { password: "", confirm_password: "" },
    validate: resetPasswordErrors,
    async onSubmit(values) {
      try {
        await resetPassword.mutateAsync({
          token,
          new_password: values.password,
        });
        setSuccess(true);
      } catch (error) {
        if (isExpiredTokenError(error)) {
          setExpired(true);
          return;
        }
        throw error;
      }
    },
  });

  if (!token) {
    return (
      <div className="space-y-4">
        <Alert>
          This reset link is missing a token. Request a new password reset
          email.
        </Alert>
        <Link
          href="/forgot-password"
          className="text-[12.5px] font-semibold text-link"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="space-y-4">
        <Alert>This reset link is invalid or has expired.</Alert>
        <Link
          href="/forgot-password"
          className="text-[12.5px] font-semibold text-link"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-4">
        <Alert tone="success">
          Your password has been updated. You can now sign in.
        </Alert>
        <Link href="/login" className="text-[12.5px] font-semibold text-link">
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
      {form.formError ? <Alert>{form.formError}</Alert> : null}

      <PasswordField
        id="password"
        name="password"
        autoComplete="new-password"
        label="New password"
        value={form.values.password}
        onChange={form.handleChange}
        error={form.errors.password}
        hint="Min 8 characters with upper, lower, number, and special character."
      />
      <PasswordField
        id="confirm_password"
        name="confirm_password"
        autoComplete="new-password"
        label="Confirm password"
        value={form.values.confirm_password}
        onChange={form.handleChange}
        error={form.errors.confirm_password}
      />

      <Button
        type="submit"
        className="mt-1 h-[42px] w-full text-sm font-bold"
        disabled={form.submitting}
        loading={form.submitting}
      >
        {form.submitting ? "Updating password…" : "Update password"}
      </Button>
    </form>
  );
}
