"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ThemeSwitch } from "@/components/layout/theme-toggle";
import { roleLabel } from "@/lib/auth/permissions";
import { displayName } from "@/lib/utils/names";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileCard() {
  const { user, me, status, error } = useAuth();
  const role =
    me?.workspace_role ??
    me?.organization?.role ??
    (user?.is_super_admin ? "SUPER_ADMIN" : user?.role ?? null);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error && !user) {
    return <Alert>Your profile could not be loaded.</Alert>;
  }

  if (!user) {
    return (
      <EmptyState
        title="No profile information available."
        description="Sign in again to reload your account."
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-1">
          Profile
        </h1>
        <p className="mt-1 text-[13px] text-text-3">
          Account details from your AnalyticCastle session.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        <nav
          className="flex flex-row gap-1 overflow-x-auto md:flex-col"
          aria-label="Settings"
        >
          <SettingsNavLink href="/profile" active>
            Profile
          </SettingsNavLink>
          <SettingsNavLink href="/account/password">Security</SettingsNavLink>
        </nav>

        <Card className="divide-y divide-border p-0">
          <SettingsRow
            label="Name"
            description={displayName(user)}
          />
          <SettingsRow label="Email" description={user.email || "—"} />
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-[13.5px] font-semibold text-text-1">Role</p>
              <p className="mt-1 text-[12px] text-text-3">
                Your role in the current organization
              </p>
            </div>
            <Badge>{roleLabel(role)}</Badge>
          </div>
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-[13.5px] font-semibold text-text-1">
                Email verification
              </p>
              <p className="mt-1 text-[12px] text-text-3">
                Status of your account email address
              </p>
            </div>
            <Badge tone={user.email_verified ? "ready" : "failed"}>
              {user.email_verified ? "Verified" : "Pending"}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-[13.5px] font-semibold text-text-1">Dark mode</p>
              <p className="mt-1 text-[12px] text-text-3">
                Match the product preview theme
              </p>
            </div>
            <ThemeSwitch />
          </div>
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-[13.5px] font-semibold text-text-1">Password</p>
              <p className="mt-1 text-[12px] text-text-3">
                Update your account password
              </p>
            </div>
            <Link href="/account/password">
              <Button variant="outline" size="sm">
                Change
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SettingsNavLink({
  href,
  children,
  active = false,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`ac-focus-ring whitespace-nowrap rounded-sm px-3 py-[9px] text-[13px] font-medium ${
        active
          ? "bg-signal-tint text-signal [[data-theme=dark]_&]:text-link"
          : "text-text-2 hover:bg-sunken"
      }`}
    >
      {children}
    </Link>
  );
}

function SettingsRow({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4">
      <div>
        <p className="text-[13.5px] font-semibold text-text-1">{label}</p>
        <p className="mt-1 text-[12px] text-text-3">{description}</p>
      </div>
    </div>
  );
}
