"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { workspaceNameErrors } from "@/features/workspace/schemas";
import { useCreateWorkspace } from "@/features/workspace/hooks/use-workspaces";
import { useForm } from "@/hooks/shared/use-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";

export function CreateWorkspaceForm({
  heading = "Create a workspace",
}: {
  heading?: string;
}) {
  const router = useRouter();
  const { me } = useAuth();
  const createWorkspace = useCreateWorkspace();

  const form = useForm({
    initialValues: { name: "" },
    validate: workspaceNameErrors,
    async onSubmit(values) {
      await createWorkspace.mutateAsync({ name: values.name.trim(), me });
      router.replace("/home");
    },
  });

  return (
    <Card className="mx-auto w-full max-w-md space-y-4 p-6 sm:p-8">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight text-text-1">
          {heading}
        </h1>
        <p className="mt-2 text-[13px] text-text-3">
          {me?.organization
            ? "Add another workspace in your organization."
            : "This creates your organization and a default workspace."}
        </p>
      </div>

      <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
        {form.formError ? <Alert>{form.formError}</Alert> : null}

        <Field
          id="name"
          name="name"
          label={me?.organization ? "Workspace name" : "Organization name"}
          value={form.values.name}
          onChange={form.handleChange}
          error={form.errors.name}
          autoComplete="organization"
          placeholder="Acme Analytics"
        />

        <Button
          type="submit"
          className="h-[42px] w-full text-sm font-bold"
          disabled={form.submitting}
          loading={form.submitting}
        >
          {form.submitting ? "Creating…" : "Create workspace"}
        </Button>
      </form>
    </Card>
  );
}
