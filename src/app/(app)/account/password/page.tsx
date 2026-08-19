import Link from "next/link";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";

export default function ChangePasswordPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-1">
          Change password
        </h1>
        <p className="mt-1 text-[13px] text-text-3">
          Choose a new password for your account.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        <nav
          className="flex flex-row gap-1 overflow-x-auto md:flex-col"
          aria-label="Settings"
        >
          <Link
            href="/profile"
            className="ac-focus-ring whitespace-nowrap rounded-sm px-3 py-[9px] text-[13px] font-medium text-text-2 hover:bg-sunken"
          >
            Profile
          </Link>
          <Link
            href="/account/password"
            className="ac-focus-ring whitespace-nowrap rounded-sm bg-signal-tint px-3 py-[9px] text-[13px] font-medium text-signal [[data-theme=dark]_&]:text-link"
          >
            Security
          </Link>
        </nav>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
