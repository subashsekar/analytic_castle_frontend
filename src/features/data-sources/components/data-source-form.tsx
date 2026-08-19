"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useCreateDataSource } from "@/features/data-sources/hooks/use-data-sources";
import { dataSourceFormErrors } from "@/features/data-sources/schemas";
import {
  DEFAULT_POSTGRES_PORT,
  DEFAULT_SSL_MODE,
  SSL_MODE_LABELS,
  SSL_MODES,
  type DataSourceFormValues,
  type SslMode,
} from "@/features/data-sources/types";
import { useForm } from "@/hooks/shared/use-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, PasswordField, SelectField } from "@/components/ui/field";

const initialValues: DataSourceFormValues = {
  name: "",
  host: "",
  port: String(DEFAULT_POSTGRES_PORT),
  database_name: "",
  username: "",
  password: "",
  ssl_mode: DEFAULT_SSL_MODE,
};

export function DataSourceForm() {
  const router = useRouter();
  const { workspace, can } = useAuth();
  const createDataSource = useCreateDataSource();
  const canCreate = can("data_source:create");

  const form = useForm({
    initialValues,
    validate: dataSourceFormErrors,
    async onSubmit(values) {
      if (!workspace?.id) {
        throw new Error("Select a workspace before adding a data source.");
      }

      const created = await createDataSource.mutateAsync({
        workspace_id: workspace.id,
        name: values.name.trim(),
        type: "POSTGRESQL",
        connection: {
          host: values.host.trim(),
          port: Number(values.port.trim()),
          database_name: values.database_name.trim(),
          username: values.username.trim(),
          password: values.password,
          ssl_mode: values.ssl_mode as SslMode,
        },
      });
      form.reset(initialValues);
      router.replace(`/data-sources/${created.id}?created=1`);
    },
  });

  if (!canCreate) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-1">
            Add data source
          </h1>
          <p className="mt-1 text-[13px] text-text-3">
            Connect a PostgreSQL database to{" "}
            {workspace?.name ?? "this workspace"}.
          </p>
        </div>
        <Alert>
          You do not have permission to add a data source in this workspace.
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-1">
          Add data source
        </h1>
        <p className="mt-1 text-[13px] text-text-3">
          Save a PostgreSQL connection for {workspace?.name ?? "this workspace"}
          . Test the connection after it is created.
        </p>
      </div>

      <Card>
        <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
          {form.formError ? <Alert>{form.formError}</Alert> : null}

          <Field
            id="name"
            name="name"
            label="Name"
            value={form.values.name}
            onChange={form.handleChange}
            error={form.errors.name}
            autoComplete="off"
            placeholder="Production analytics"
          />

          <div className="rounded-sm border border-border bg-sunken/40 px-3 py-2 text-[12.5px] text-text-3">
            Type: PostgreSQL
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="host"
              name="host"
              label="Host"
              value={form.values.host}
              onChange={form.handleChange}
              error={form.errors.host}
              autoComplete="off"
              placeholder="db.example.com"
            />
            <Field
              id="port"
              name="port"
              label="Port"
              inputMode="numeric"
              value={form.values.port}
              onChange={form.handleChange}
              error={form.errors.port}
              autoComplete="off"
            />
          </div>

          <Field
            id="database_name"
            name="database_name"
            label="Database"
            value={form.values.database_name}
            onChange={form.handleChange}
            error={form.errors.database_name}
            autoComplete="off"
            placeholder="analytics"
          />

          <Field
            id="username"
            name="username"
            label="Username"
            value={form.values.username}
            onChange={form.handleChange}
            error={form.errors.username}
            autoComplete="off"
          />

          <PasswordField
            id="password"
            name="password"
            label="Password"
            value={form.values.password}
            onChange={form.handleChange}
            error={form.errors.password}
            autoComplete="new-password"
          />

          <SelectField
            id="ssl_mode"
            name="ssl_mode"
            label="SSL mode"
            value={form.values.ssl_mode}
            onChange={form.handleChange}
            error={form.errors.ssl_mode}
          >
            {SSL_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {SSL_MODE_LABELS[mode]}
              </option>
            ))}
          </SelectField>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/data-sources")}
              disabled={form.submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={form.submitting}
              loading={form.submitting}
            >
              {form.submitting ? "Saving…" : "Save data source"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
