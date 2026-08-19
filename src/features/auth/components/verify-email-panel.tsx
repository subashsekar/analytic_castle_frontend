"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { verifyEmail } from "@/features/auth/api";
import { useResendVerification } from "@/features/auth/hooks/use-auth-mutations";
import { resendVerificationErrors } from "@/features/auth/schemas";
import { useForm } from "@/hooks/shared/use-form";
import { isExpiredTokenError } from "@/lib/api/errors";
import { hasSession, subscribeSession } from "@/lib/auth/session";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

type VerifyState = "idle" | "verifying" | "success" | "expired" | "error";

export function VerifyEmailPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const emailFromQuery = searchParams.get("email") ?? "";
  const resend = useResendVerification();
  const [state, setState] = useState<VerifyState>(token ? "verifying" : "idle");
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const signedIn = useSyncExternalStore(
    subscribeSession,
    hasSession,
    () => false,
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    verifyEmail({ token })
      .then(() => {
        if (!cancelled) {
          setState("success");
        }
      })
      .catch((reason: unknown) => {
        if (cancelled) {
          return;
        }
        if (isExpiredTokenError(reason)) {
          setState("expired");
          return;
        }
        setError(
          reason instanceof Error ? reason.message : "Verification failed.",
        );
        setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (state !== "success" || !signedIn) {
      return;
    }
    const timer = window.setTimeout(() => {
      router.replace("/home");
    }, 800);
    return () => window.clearTimeout(timer);
  }, [router, signedIn, state]);

  const form = useForm({
    initialValues: { email: emailFromQuery },
    validate: resendVerificationErrors,
    async onSubmit(values) {
      await resend.mutateAsync(values.email.trim());
      setResent(true);
    },
  });

  if (state === "verifying") {
    return <Spinner label="Verifying your email" />;
  }

  if (state === "success") {
    return (
      <div className="space-y-4">
        <Alert tone="success">
          Your email is verified.
          {signedIn
            ? " Taking you to your workspace…"
            : " You can now sign in."}
        </Alert>
        <Link
          href={signedIn ? "/home" : "/login"}
          className="text-[12.5px] font-semibold text-link"
        >
          {signedIn ? "Continue to home" : "Continue to sign in"}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {state === "expired" ? (
        <Alert>This verification link is invalid or has expired.</Alert>
      ) : null}
      {state === "error" && error ? <Alert>{error}</Alert> : null}
      {state === "idle" ? (
        <p className="text-[13px] text-text-3">
          We sent a verification link to your email. You can also request a new
          one below.
        </p>
      ) : null}

      {resent ? (
        <Alert tone="success">
          If an account exists for that email, a new verification link was sent.
        </Alert>
      ) : null}
      {form.formError ? <Alert>{form.formError}</Alert> : null}

      <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
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
          className="h-[42px] w-full text-sm font-bold"
          disabled={form.submitting}
          loading={form.submitting}
        >
          {form.submitting ? "Sending…" : "Resend verification email"}
        </Button>
      </form>

      <p className="text-center text-[12.5px] text-text-3">
        <Link
          href={signedIn ? "/home" : "/login"}
          className="font-semibold text-link"
        >
          {signedIn ? "Continue to home" : "Back to sign in"}
        </Link>
      </p>
    </div>
  );
}
