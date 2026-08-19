import { Suspense } from "react";
import { AuthFormLayout } from "@/components/layout/auth-form-layout";
import { GuestGate } from "@/features/auth/components/auth-guards";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { PageSpinner } from "@/components/ui/spinner";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<PageSpinner label="Loading" />}>
      <GuestGate>
        <AuthFormLayout
          title="Forgot password"
          description="Enter your email and we will send a reset link if an account exists."
        >
          <ForgotPasswordForm />
        </AuthFormLayout>
      </GuestGate>
    </Suspense>
  );
}
