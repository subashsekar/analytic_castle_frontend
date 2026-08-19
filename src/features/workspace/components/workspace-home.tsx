"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { roleLabel } from "@/lib/auth/permissions";
import { displayName } from "@/lib/utils/names";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function WorkspaceHome() {
  const { user, me, workspace, can, isVerified } = useAuth();
  const role =
    me?.workspace_role ??
    me?.organization?.role ??
    (user?.is_super_admin ? "SUPER_ADMIN" : (user?.role ?? null));
  const firstName =
    user?.first_name?.trim() || (user ? displayName(user) : "there");

  return (
    <div className="space-y-6">
      <div className="pagehead flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-1">
            Good {greeting()}, {firstName}
          </h1>
          <p className="mt-1 text-[13px] text-text-3">
            {workspace?.name ?? "Workspace"}
            {role ? (
              <span className="ml-2 inline-flex align-middle">
                <Badge>{roleLabel(role)}</Badge>
              </span>
            ) : null}
          </p>
        </div>
      </div>

      {!isVerified ? (
        <Alert>
          Please verify your email to unlock all account features.{" "}
          <Link href="/verify-email" className="font-semibold text-link">
            Resend verification
          </Link>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <HomeCard
          title="Profile"
          description="Name, email, and verification status."
          href="/profile"
          action="View profile"
        />
        <HomeCard
          title="Data sources"
          description="Connect PostgreSQL databases for this workspace."
          href="/data-sources"
          action="View data sources"
        />
        <HomeCard
          title="Team"
          description="People with access to this workspace."
          href="/workspace/members"
          action="View team"
        />
        {can("workspace.admin") ? (
          <HomeCard
            title="Workspace settings"
            description="Update the workspace name and review details."
            href="/workspace/settings"
            action="Open settings"
          />
        ) : null}
      </div>
    </div>
  );
}

function HomeCard({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <Card className="flex flex-col">
      <h2 className="text-[14.5px] font-bold text-text-1">{title}</h2>
      <p className="mt-1 text-[12px] text-text-3">{description}</p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-link"
      >
        {action}
        <ArrowRight size={14} strokeWidth={1.5} />
      </Link>
    </Card>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}
