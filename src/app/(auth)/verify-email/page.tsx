import { Suspense } from "react";
import { AuthFormLayout } from "@/components/layout/auth-form-layout";
import { VerifyEmailPanel } from "@/features/auth/components/verify-email-panel";
import { PageSpinner } from "@/components/ui/spinner";

export default function VerifyEmailPage() {
  return (
    <AuthFormLayout
      title="Verify your email"
      description="Confirm your email address to continue."
    >
      <Suspense fallback={<PageSpinner label="Loading" />}>
        <VerifyEmailPanel />
      </Suspense>
    </AuthFormLayout>
  );
}
