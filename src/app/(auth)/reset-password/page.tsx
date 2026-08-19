import { Suspense } from "react";
import { AuthFormLayout } from "@/components/layout/auth-form-layout";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { PageSpinner } from "@/components/ui/spinner";

export default function ResetPasswordPage() {
  return (
    <AuthFormLayout
      title="Reset password"
      description="Choose a new password for your account."
    >
      <Suspense fallback={<PageSpinner label="Loading" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthFormLayout>
  );
}
