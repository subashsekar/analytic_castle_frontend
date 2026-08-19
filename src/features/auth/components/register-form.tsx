"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRegister } from "@/features/auth/hooks/use-auth-mutations";
import { registerErrors } from "@/features/auth/schemas";
import { useForm } from "@/hooks/shared/use-form";
import { ApiError } from "@/lib/api/errors";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, PasswordField } from "@/components/ui/field";

export function RegisterForm() {
  const router = useRouter();
  const register = useRegister();
  const [success, setSuccess] = useState(false);

  const form = useForm({
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
    },
    validate: registerErrors,
    async onSubmit(values) {
      await register.mutateAsync({
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      setSuccess(true);
      router.replace(
        `/verify-email?email=${encodeURIComponent(values.email.trim())}`,
      );
    },
  });

  const errorMessage =
    form.formError &&
    register.error instanceof ApiError &&
    register.error.status === 409
      ? "An account with this email already exists."
      : form.formError;

  if (success) {
    return (
      <Alert tone="success">
        Account created. Check your email to verify your address.
      </Alert>
    );
  }

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
      {errorMessage ? <Alert>{errorMessage}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="first_name"
          name="first_name"
          autoComplete="given-name"
          label="First name"
          value={form.values.first_name}
          onChange={form.handleChange}
          error={form.errors.first_name}
        />
        <Field
          id="last_name"
          name="last_name"
          autoComplete="family-name"
          label="Last name"
          value={form.values.last_name}
          onChange={form.handleChange}
          error={form.errors.last_name}
        />
      </div>
      <Field
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        label="Work email"
        value={form.values.email}
        onChange={form.handleChange}
        error={form.errors.email}
        placeholder="you@company.com"
      />
      <PasswordField
        id="password"
        name="password"
        autoComplete="new-password"
        label="Password"
        value={form.values.password}
        onChange={form.handleChange}
        error={form.errors.password}
        hint="Min 8 characters with upper, lower, number, and special character."
        placeholder="SecurePassword123!"
      />

      <Button
        type="submit"
        className="mt-1 h-[42px] w-full text-sm font-bold"
        disabled={form.submitting}
        loading={form.submitting}
      >
        {form.submitting ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-[12.5px] text-text-3">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-link">
          Sign in
        </Link>
      </p>
    </form>
  );
}
