"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { composeMe, getCurrentUser } from "@/features/auth/api";
import { useLogin } from "@/features/auth/hooks/use-auth-mutations";
import { postAuthPath } from "@/features/auth/post-auth-path";
import { loginErrors } from "@/features/auth/schemas";
import { decideWorkspace } from "@/features/workspace/workspace-decision";
import { useForm } from "@/hooks/shared/use-form";
import { ApiError } from "@/lib/api/errors";
import { getWorkspaceId, setSession, setWorkspaceId } from "@/lib/auth/session";
import { isSafeNextPath } from "@/lib/constants/routes";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, PasswordField } from "@/components/ui/field";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();

  const form = useForm({
    initialValues: { email: "", password: "" },
    validate: loginErrors,
    async onSubmit(values) {
      const result = await login.mutateAsync({
        email: values.email.trim(),
        password: values.password,
      });

      setSession({
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      });

      const me = result.user
        ? await composeMe(result.user)
        : await getCurrentUser();
      const decision = decideWorkspace(
        me.workspaces,
        getWorkspaceId() ?? me.workspace?.id ?? null,
      );
      if (decision.action === "use") {
        setWorkspaceId(decision.workspace.id);
      }

      const next = searchParams.get("next");
      if (isSafeNextPath(next) && decision.action === "use") {
        router.replace(next);
        return;
      }

      router.replace(postAuthPath(me, getWorkspaceId()));
    },
  });

  const errorMessage =
    form.formError &&
    login.error instanceof ApiError &&
    login.error.status === 401
      ? "Invalid email or password."
      : form.formError;

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
      {errorMessage ? <Alert>{errorMessage}</Alert> : null}

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
      <PasswordField
        id="password"
        name="password"
        autoComplete="current-password"
        label="Password"
        value={form.values.password}
        onChange={form.handleChange}
        error={form.errors.password}
      />

      <div className="flex items-center justify-between text-[12.5px]">
        <Link
          href="/forgot-password"
          className="font-semibold text-link hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        className="mt-1 h-[42px] w-full text-sm font-bold"
        disabled={form.submitting}
        loading={form.submitting}
      >
        {form.submitting ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-center text-[12.5px] text-text-3">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-link">
          Sign up
        </Link>
      </p>
    </form>
  );
}
