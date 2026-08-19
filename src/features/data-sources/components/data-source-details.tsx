"use client";

import { useCallback, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  useDataSource,
  useDeleteDataSource,
  useTestDataSource,
  useUpdateDataSource,
} from "@/features/data-sources/hooks/use-data-sources";
import { dataSourceNameErrors } from "@/features/data-sources/schemas";
import { DeleteDataSourceDialog } from "@/features/data-sources/components/delete-data-source-dialog";
import {
  DataSourceStatusBadge,
  dataSourceTypeLabel,
  formatTimestamp,
} from "@/features/data-sources/components/data-source-status";
import { useForm } from "@/hooks/shared/use-form";
import { getErrorStatus } from "@/lib/api/errors";
import { dataSourceErrorMessage } from "@/features/data-sources/errors";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { PageSpinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

export function DataSourceDetailsPage() {
  const params = useParams<{ id: string }>();
  const dataSourceId = params.id;
  if (!dataSourceId) {
    return <PageSpinner label="Loading data source" />;
  }
  return <DataSourceDetails dataSourceId={dataSourceId} />;
}

export function DataSourceDetails({ dataSourceId }: { dataSourceId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { workspace, can } = useAuth();
  const query = useDataSource(dataSourceId || null);
  const testConnection = useTestDataSource();
  const deleteDataSource = useDeleteDataSource();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(
    searchParams.get("created") === "1"
      ? "Data source created successfully."
      : null,
  );
  const [testTone, setTestTone] = useState<"success" | "error">(
    searchParams.get("created") === "1" ? "success" : "error",
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const dataSource = query.data;
  const belongsToWorkspace =
    !dataSource || !workspace?.id || dataSource.workspace_id === workspace.id;
  const canUpdate = can("data_source:update");
  const canDelete = can("data_source:delete");
  const canTest = can("data_source:test");
  const testing = testConnection.isPending;
  const status = getErrorStatus(query.error);

  const closeDelete = useCallback(() => {
    if (!deleteDataSource.isPending) {
      setDeleteOpen(false);
    }
  }, [deleteDataSource.isPending]);

  async function handleTest() {
    setDeleteError(null);
    try {
      const result = await testConnection.mutateAsync(dataSourceId);
      setTestTone(result.success ? "success" : "error");
      setTestMessage(
        result.message ||
          (result.success
            ? "Connection successful."
            : "Unable to connect to the data source."),
      );
    } catch (error) {
      setTestTone("error");
      setTestMessage(dataSourceErrorMessage(error));
    }
  }

  async function handleDelete() {
    if (!workspace?.id) {
      return;
    }
    setDeleteError(null);
    try {
      await deleteDataSource.mutateAsync({
        dataSourceId,
        workspaceId: workspace.id,
      });
      router.replace("/data-sources?deleted=1");
    } catch (error) {
      setDeleteError(dataSourceErrorMessage(error));
      setDeleteOpen(false);
    }
  }

  if (query.isLoading && !dataSource) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <PageSpinner label="Loading data source" />
      </div>
    );
  }

  if (status === 403 || status === 404 || !belongsToWorkspace) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-text-1">
          Data source
        </h1>
        <Alert>Data source not found.</Alert>
        <Link
          href="/data-sources"
          className="text-[13px] font-semibold text-link"
        >
          Back to data sources
        </Link>
      </div>
    );
  }

  if (query.isError || !dataSource) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-text-1">
          Data source
        </h1>
        <Alert>Data source details could not be loaded.</Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-text-3">
            <Link href="/data-sources" className="text-text-2 hover:text-link">
              Data sources
            </Link>
            <span className="mx-1.5 opacity-50">/</span>
            <span className="text-text-1">{dataSource.name}</span>
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-text-1">
            {dataSource.name}
          </h1>
          <p className="mt-1 text-[13px] text-text-3">
            {dataSourceTypeLabel(dataSource.type)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/data-sources/${dataSource.id}/explore`}
            className="ac-press inline-flex h-[38px] min-h-11 items-center justify-center rounded-sm border border-border-strong px-4 text-[13.5px] font-semibold text-text-1 hover:border-text-3 hover:bg-sunken sm:min-h-0"
          >
            Explore schema
          </Link>
          {canTest ? (
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={testing}
              loading={testing}
            >
              {testing ? "Testing…" : "Test connection"}
            </Button>
          ) : null}
          {canDelete ? (
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          ) : null}
        </div>
      </div>

      {testMessage ? <Alert tone={testTone}>{testMessage}</Alert> : null}
      {deleteError ? <Alert>{deleteError}</Alert> : null}

      <Card className="divide-y divide-border p-0">
        <SettingsRow label="Name" value={dataSource.name} />
        <SettingsRow
          label="Database type"
          value={dataSourceTypeLabel(dataSource.type)}
        />
        <SettingsRow
          label="Connection status"
          value={
            <DataSourceStatusBadge
              status={dataSource.status}
              testing={testing}
            />
          }
        />
        <SettingsRow
          label="Last tested"
          value={formatTimestamp(dataSource.last_tested_at)}
        />
        <SettingsRow
          label="Created"
          value={formatTimestamp(dataSource.created_at)}
        />
        <SettingsRow
          label="Updated"
          value={formatTimestamp(dataSource.updated_at)}
        />
      </Card>

      {canUpdate ? (
        <RenameDataSourceForm
          key={`${dataSource.id}:${dataSource.name}`}
          dataSourceId={dataSource.id}
          name={dataSource.name}
        />
      ) : null}

      <DeleteDataSourceDialog
        open={deleteOpen}
        name={dataSource.name}
        deleting={deleteDataSource.isPending}
        onCancel={closeDelete}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function SettingsRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4">
      <div>
        <p className="text-[13.5px] font-semibold text-text-1">{label}</p>
        <div className="mt-1 text-[12px] text-text-3">{value}</div>
      </div>
    </div>
  );
}

function RenameDataSourceForm({
  dataSourceId,
  name,
}: {
  dataSourceId: string;
  name: string;
}) {
  const updateDataSource = useUpdateDataSource(dataSourceId);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    initialValues: { name },
    validate: dataSourceNameErrors,
    async onSubmit(values) {
      await updateDataSource.mutateAsync({ name: values.name.trim() });
      setSuccess(true);
    },
  });

  return (
    <Card>
      <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
        <div>
          <h2 className="text-[14.5px] font-bold text-text-1">Rename</h2>
          <p className="mt-1 text-[12px] text-text-3">
            Connection credentials cannot be changed after the data source is
            saved.
          </p>
        </div>
        {success ? (
          <Alert tone="success">Data source updated successfully.</Alert>
        ) : null}
        {form.formError ? <Alert>{form.formError}</Alert> : null}
        <Field
          id="name"
          name="name"
          label="Name"
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
