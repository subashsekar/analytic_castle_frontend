"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  useDataSources,
  useDeleteDataSource,
  useTestDataSource,
} from "@/features/data-sources/hooks/use-data-sources";
import { DataSourceCard } from "@/features/data-sources/components/data-source-card";
import { DeleteDataSourceDialog } from "@/features/data-sources/components/delete-data-source-dialog";
import type { DataSource } from "@/features/data-sources/types";
import { getErrorStatus } from "@/lib/api/errors";
import { dataSourceErrorMessage } from "@/features/data-sources/errors";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSpinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

export function DataSourceList() {
  const searchParams = useSearchParams();
  const { workspace, can } = useAuth();
  const listQuery = useDataSources(workspace?.id ?? null);
  const testConnection = useTestDataSource();
  const deleteDataSource = useDeleteDataSource();
  const [pendingDelete, setPendingDelete] = useState<DataSource | null>(null);
  const [feedback, setFeedback] = useState<string | null>(
    searchParams.get("deleted") === "1"
      ? "Data source deleted successfully."
      : null,
  );
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error">(
    "success",
  );

  const canCreate = can("data_source:create");
  const canTest = can("data_source:test");
  const canDelete = can("data_source:delete");
  const status = getErrorStatus(listQuery.error);

  const closeDelete = useCallback(() => {
    if (!deleteDataSource.isPending) {
      setPendingDelete(null);
    }
  }, [deleteDataSource.isPending]);

  async function handleTest(dataSource: DataSource) {
    try {
      const result = await testConnection.mutateAsync(dataSource.id);
      setFeedbackTone(result.success ? "success" : "error");
      setFeedback(
        result.message ||
          (result.success
            ? "Connection successful."
            : "Unable to connect to the data source."),
      );
    } catch (error) {
      setFeedbackTone("error");
      setFeedback(dataSourceErrorMessage(error));
    }
  }

  async function handleDelete() {
    if (!pendingDelete || !workspace?.id) {
      return;
    }
    try {
      await deleteDataSource.mutateAsync({
        dataSourceId: pendingDelete.id,
        workspaceId: workspace.id,
      });
      setPendingDelete(null);
      setFeedbackTone("success");
      setFeedback("Data source deleted successfully.");
    } catch (error) {
      setFeedbackTone("error");
      setFeedback(dataSourceErrorMessage(error));
      setPendingDelete(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-1">
            Data sources
          </h1>
          <p className="mt-1 text-[13px] text-text-3">
            PostgreSQL connections for {workspace?.name ?? "this workspace"}.
          </p>
        </div>
        {canCreate ? (
          <Link
            href="/data-sources/new"
            className="ac-press inline-flex h-[38px] min-h-11 items-center justify-center rounded-sm bg-signal px-4 text-[13.5px] font-semibold text-white hover:bg-signal-hover sm:min-h-0"
          >
            Add data source
          </Link>
        ) : null}
      </div>

      {feedback ? <Alert tone={feedbackTone}>{feedback}</Alert> : null}

      {listQuery.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <PageSpinner label="Loading data sources" />
        </div>
      ) : null}

      {status === 403 ? (
        <Alert>You do not have permission to do that.</Alert>
      ) : null}

      {status === 404 ? <Alert>Data source not found.</Alert> : null}

      {listQuery.isError && status !== 403 && status !== 404 ? (
        <Alert>Data sources could not be loaded.</Alert>
      ) : null}

      {listQuery.data && listQuery.data.length === 0 ? (
        <EmptyState
          title="No data sources have been added"
          description="Connect a PostgreSQL database to this workspace, then test the connection from the data source details."
          action={
            canCreate ? (
              <Link
                href="/data-sources/new"
                className="ac-press inline-flex h-[38px] min-h-11 items-center justify-center rounded-sm bg-signal px-4 text-[13.5px] font-semibold text-white hover:bg-signal-hover"
              >
                Add data source
              </Link>
            ) : undefined
          }
        />
      ) : null}

      {listQuery.data && listQuery.data.length > 0 ? (
        <ul className="overflow-hidden rounded-md border border-border bg-surface">
          {listQuery.data.map((dataSource, index) => (
            <DataSourceCard
              key={dataSource.id}
              dataSource={dataSource}
              testing={
                testConnection.isPending &&
                testConnection.variables === dataSource.id
              }
              canTest={canTest}
              canDelete={canDelete}
              onTest={() => handleTest(dataSource)}
              onDelete={() => setPendingDelete(dataSource)}
              className={index > 0 ? "border-t border-border" : ""}
            />
          ))}
        </ul>
      ) : null}

      <DeleteDataSourceDialog
        open={Boolean(pendingDelete)}
        name={pendingDelete?.name ?? "data source"}
        deleting={deleteDataSource.isPending}
        onCancel={closeDelete}
        onConfirm={handleDelete}
      />
    </div>
  );
}
