import { CreateWorkspaceForm } from "@/features/workspace/components/create-workspace-form";
import { EmptyState } from "@/components/ui/empty-state";

export default function NewWorkspacePage() {
  return (
    <div className="space-y-8">
      <EmptyState
        title="No workspace yet"
        description="Create your first workspace to continue."
      />
      <CreateWorkspaceForm />
    </div>
  );
}
