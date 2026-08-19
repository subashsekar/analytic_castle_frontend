import { Suspense } from "react";
import { AuthFormLayout } from "@/components/layout/auth-form-layout";
import { GuestGate } from "@/features/auth/components/auth-guards";
import { LoginForm } from "@/features/auth/components/login-form";
import { PageSpinner } from "@/components/ui/spinner";

export default function LoginPage() {
  return (
    <Suspense fallback={<PageSpinner label="Loading" />}>
      <GuestGate>
        <AuthFormLayout
          title="Welcome back"
          description="Sign in to your workspace"
        >
          <LoginForm />
        </AuthFormLayout>
      </GuestGate>
    </Suspense>
  );
}
