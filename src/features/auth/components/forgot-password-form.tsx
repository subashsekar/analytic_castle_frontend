"use client";

import Link from "next/link";
import { useState } from "react";
import { useForgotPassword } from "@/features/auth/hooks/use-auth-mutations";
import { forgotPasswordErrors } from "@/features/auth/schemas";
import { useForm } from "@/hooks/shared/use-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

const GENERIC_SUCCESS = "If the account exists, a reset email was sent.";

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    initialValues: { email: "" },
    validate: forgotPasswordErrors,
    async onSubmit(values) {
      await forgotPassword.mutateAsync(values.email.trim());
      setSubmitted(true);
    },
  });

  if (submitted) {
    return (
      <div className="space-y-4">
        <Alert tone="success">{GENERIC_SUCCESS}</Alert>
        <Link href="/login" className="text-[12.5px] font-semibold text-link">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
      {form.formError ? <Alert>{form.formError}</Alert> : null}

      <Field
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        label="Email"
        value={form.values.email}
        onChange={form.handleChange}
        error={form.errors.email}
      />

      <Button
        type="submit"
        className="mt-1 h-[42px] w-full text-sm font-bold"
        disabled={form.submitting}
        loading={form.submitting}
      >
        {form.submitting ? "Sending…" : "Send reset link"}
      </Button>

      <p className="text-center text-[12.5px] text-text-3">
        <Link href="/login" className="font-semibold text-link">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
