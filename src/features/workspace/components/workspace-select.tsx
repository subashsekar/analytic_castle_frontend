"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSpinner } from "@/components/ui/spinner";

export function WorkspaceSelect() {
  const router = useRouter();
  const { me, status, switchWorkspace, isSwitchingWorkspace } = useAuth();

  if (status === "loading") {
    return <PageSpinner label="Loading workspaces" />;
  }

  const workspaces = me?.workspaces ?? [];

  if (workspaces.length === 0) {
    return (
      <EmptyState
        title="No workspace yet"
        description="Create your first workspace to continue."
        action={
          <Button onClick={() => router.replace("/workspace/new")}>
            Create workspace
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-1">
          Select a workspace
        </h1>
        <p className="mt-2 text-[13px] text-text-3">
          Choose which workspace to open.
        </p>
      </div>

      {me === null ? (
        <Alert>Workspaces could not be loaded.</Alert>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {workspaces.map((workspace) => (
            <Card key={workspace.id} className="flex flex-col">
              <h2 className="text-[14.5px] font-bold text-text-1">
                {workspace.name}
              </h2>
              {workspace.slug ? (
                <p className="mt-1 font-mono-tabular text-[12px] text-text-3">
                  {workspace.slug}
                </p>
              ) : null}
              <Button
                className="mt-4 self-start"
                disabled={isSwitchingWorkspace}
                loading={isSwitchingWorkspace}
                onClick={async () => {
                  await switchWorkspace(workspace);
                  router.replace("/home");
                }}
              >
                {isSwitchingWorkspace ? "Opening…" : "Open"}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
