"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { useTeamMembers } from "@/features/team/hooks/use-team-members";
import { roleLabel } from "@/lib/auth/permissions";
import { displayName } from "@/lib/utils/names";
import { initials } from "@/lib/utils/initials";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSpinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

export function TeamMembersList() {
  const { workspace } = useAuth();
  const membersQuery = useTeamMembers(workspace?.id ?? null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-1">Team</h1>
        <p className="mt-1 text-[13px] text-text-3">
          People in {workspace?.name ?? "this workspace"}.
        </p>
      </div>

      {membersQuery.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <PageSpinner label="Loading team" />
        </div>
      ) : null}

      {membersQuery.isError ? (
        <Alert>Team members could not be loaded.</Alert>
      ) : null}

      {membersQuery.data && membersQuery.data.length === 0 ? (
        <EmptyState
          title="No team members found."
          description="No one is listed for this workspace yet."
        />
      ) : null}

      {membersQuery.data && membersQuery.data.length > 0 ? (
        <ul className="overflow-hidden rounded-md border border-border bg-surface">
          {membersQuery.data.map((member, index) => (
            <li
              key={member.id}
              className={`flex items-center justify-between gap-4 px-4 py-3 ${
                index > 0 ? "border-t border-border" : ""
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-[34px] shrink-0 items-center justify-center rounded-sm bg-sunken text-[12px] font-bold text-text-2">
                  {initials(displayName(member))}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-text-1">
                    {displayName(member)}
                  </p>
                  <p className="truncate text-[11.5px] text-text-3">
                    {member.email || "No email"}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge>{roleLabel(member.role)}</Badge>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
