"use client";

import { useState, type ReactNode } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { workspaceNameErrors } from "@/features/workspace/schemas";
import {
  useUpdateWorkspace,
  useWorkspace,
} from "@/features/workspace/hooks/use-workspaces";
import { useForm } from "@/hooks/shared/use-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { PageSpinner } from "@/components/ui/spinner";

export function WorkspaceSettings() {
  const { workspace: active, can } = useAuth();
  const workspaceQuery = useWorkspace(active?.id ?? null);
  const workspace = workspaceQuery.data ?? active;
  const canEdit = can("workspace.admin");

  if (!active) {
    return <PageSpinner label="Loading workspace" />;
  }

  if (workspaceQuery.isLoading && !workspace) {
    return <PageSpinner label="Loading workspace" />;
  }

  if (workspaceQuery.isError && !workspace) {
    return <Alert>Workspace settings could not be loaded.</Alert>;
  }

  if (!workspace) {
    return <Alert>Workspace settings could not be loaded.</Alert>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-1">
          Workspace settings
        </h1>
        <p className="mt-1 text-[13px] text-text-3">
          Details for the currently selected workspace.
        </p>
      </div>

      <Card className="divide-y divide-border p-0">
        <SettingsRow
          label="Workspace ID"
          value={
            <span className="font-mono-tabular text-xs text-text-2">
              {workspace.id}
            </span>
          }
        />
        {workspace.slug ? (
          <SettingsRow label="Slug" value={workspace.slug} />
        ) : null}
        {!canEdit ? <SettingsRow label="Name" value={workspace.name} /> : null}
      </Card>

      {canEdit ? (
        <WorkspaceNameForm
          key={`${workspace.id}:${workspace.name}`}
          workspaceId={workspace.id}
          name={workspace.name}
        />
      ) : null}
    </div>
  );
}

function SettingsRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4">
      <div>
        <p className="text-[13.5px] font-semibold text-text-1">{label}</p>
        <div className="mt-1 text-[12px] text-text-3">{value}</div>
      </div>
    </div>
  );
}

function WorkspaceNameForm({
  workspaceId,
  name,
}: {
  workspaceId: string;
  name: string;
}) {
  const updateWorkspace = useUpdateWorkspace(workspaceId);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    initialValues: { name },
    validate: workspaceNameErrors,
    async onSubmit(values) {
      await updateWorkspace.mutateAsync(values.name.trim());
      setSuccess(true);
    },
  });

  return (
    <Card>
      <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
        {success ? <Alert tone="success">Workspace name updated.</Alert> : null}
        {form.formError ? <Alert>{form.formError}</Alert> : null}
        <Field
          id="name"
          name="name"
          label="Workspace name"
          value={form.values.name}
          onChange={form.handleChange}
          error={form.errors.name}
        />
        <Button
          type="submit"
          disabled={form.submitting}
          loading={form.submitting}
        >
          {form.submitting ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </Card>
  );
}
