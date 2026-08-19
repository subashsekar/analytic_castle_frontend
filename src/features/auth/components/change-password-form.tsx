"use client";

import { useState } from "react";
import { useChangePassword } from "@/features/auth/hooks/use-auth-mutations";
import { changePasswordErrors } from "@/features/auth/schemas";
import { useForm } from "@/hooks/shared/use-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PasswordField } from "@/components/ui/field";

export function ChangePasswordForm() {
  const changePassword = useChangePassword();
  const [success, setSuccess] = useState(false);

  const form = useForm({
    initialValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
    validate: changePasswordErrors,
    async onSubmit(values) {
      await changePassword.mutateAsync({
        current_password: values.current_password,
        new_password: values.new_password,
      });
      form.reset();
      setSuccess(true);
    },
  });

  return (
    <Card>
      <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
        {success ? (
          <Alert tone="success">Your password has been updated.</Alert>
        ) : null}
        {form.formError ? <Alert>{form.formError}</Alert> : null}

        <PasswordField
          id="current_password"
          name="current_password"
          autoComplete="current-password"
          label="Current password"
          value={form.values.current_password}
          onChange={form.handleChange}
          error={form.errors.current_password}
        />
        <PasswordField
          id="new_password"
          name="new_password"
          autoComplete="new-password"
          label="New password"
          value={form.values.new_password}
          onChange={form.handleChange}
          error={form.errors.new_password}
          hint="Min 8 characters with upper, lower, number, and special character."
        />
        <PasswordField
          id="confirm_password"
          name="confirm_password"
          autoComplete="new-password"
          label="Confirm new password"
          value={form.values.confirm_password}
          onChange={form.handleChange}
          error={form.errors.confirm_password}
        />

        <Button
          type="submit"
          disabled={form.submitting}
          loading={form.submitting}
        >
          {form.submitting ? "Updating…" : "Update password"}
        </Button>
      </form>
    </Card>
  );
}
