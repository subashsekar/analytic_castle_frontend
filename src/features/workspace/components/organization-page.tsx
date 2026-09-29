"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { organizationNameErrors } from "@/features/workspace/schemas";
import {
  useCreateOrganization,
  useOrganizations,
} from "@/features/workspace/hooks/use-workspaces";
import { useForm } from "@/hooks/shared/use-form";
import { roleLabel } from "@/lib/auth/permissions";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { PageSpinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

export function OrganizationPage() {
  const { me } = useAuth();
  const listQuery = useOrganizations();
  const organizations = listQuery.data ?? [];
  const currentOrganizationId = me?.organization?.id ?? null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-1">
          Organizations
        </h1>
        <p className="mt-1 text-[13px] text-text-3">
          Create an organization and view the ones you belong to.
        </p>
      </div>

      <CreateOrganizationForm />

      {listQuery.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <PageSpinner label="Loading organizations" />
        </div>
      ) : null}

      {listQuery.isError ? (
        <Alert>Organizations could not be loaded.</Alert>
      ) : null}

      {listQuery.data && listQuery.data.length === 0 ? (
        <EmptyState
          title="No organizations yet"
          description="Create an organization to get a default workspace and continue."
        />
      ) : null}

      {organizations.length > 0 ? (
        <ul className="overflow-hidden rounded-md border border-border bg-surface">
          {organizations.map((organization, index) => (
            <li
              key={organization.id}
              className={`flex items-center justify-between gap-4 px-4 py-3 ${
                index > 0 ? "border-t border-border" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-text-1">
                  {organization.name}
                </p>
                {organization.slug ? (
                  <p className="mt-0.5 font-mono-tabular text-[12px] text-text-3">
                    {organization.slug}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {organization.role ? (
                  <Badge>{roleLabel(organization.role)}</Badge>
                ) : null}
                {organization.id === currentOrganizationId ? (
                  <Badge tone="ready">Current</Badge>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function CreateOrganizationForm() {
  const createOrganization = useCreateOrganization();
  const [created, setCreated] = useState(false);
  const form = useForm({
    initialValues: { name: "" },
    validate: organizationNameErrors,
    async onSubmit(values) {
      setCreated(false);
      await createOrganization.mutateAsync(values.name.trim());
      setCreated(true);
    },
  });

  return (
    <Card>
      <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
        <div>
          <h2 className="text-[14.5px] font-bold text-text-1">
            Create organization
          </h2>
          <p className="mt-1 text-[12px] text-text-3">
            This also creates a default workspace and makes you the owner.
          </p>
        </div>

        {created ? (
          <Alert tone="success">Organization created.</Alert>
        ) : null}
        {form.formError ? <Alert>{form.formError}</Alert> : null}

        <Field
          id="name"
          name="name"
          label="Organization name"
          value={form.values.name}
          onChange={form.handleChange}
          error={form.errors.name}
          autoComplete="organization"
          placeholder="Acme Analytics"
        />

        <Button
          type="submit"
          disabled={form.submitting}
          loading={form.submitting}
        >
          {form.submitting ? "Creating…" : "Create organization"}
        </Button>
      </form>
    </Card>
  );
}
