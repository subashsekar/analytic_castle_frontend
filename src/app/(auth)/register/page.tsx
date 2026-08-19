import { Suspense } from "react";
import { AuthFormLayout } from "@/components/layout/auth-form-layout";
import { GuestGate } from "@/features/auth/components/auth-guards";
import { RegisterForm } from "@/features/auth/components/register-form";
import { PageSpinner } from "@/components/ui/spinner";

export default function RegisterPage() {
  return (
    <Suspense fallback={<PageSpinner label="Loading" />}>
      <GuestGate>
        <AuthFormLayout
          title="Create your workspace"
          description="Free for your first 3 datasets — no card required"
        >
          <RegisterForm />
        </AuthFormLayout>
      </GuestGate>
    </Suspense>
  );
}
