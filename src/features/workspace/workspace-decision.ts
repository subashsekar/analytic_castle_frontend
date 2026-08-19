import type { Workspace } from "@/types/common";

export type WorkspaceDecision =
  | { action: "create" }
  | { action: "use"; workspace: Workspace }
  | { action: "choose"; workspaces: Workspace[] };

export function decideWorkspace(
  workspaces: Workspace[],
  persistedId: string | null,
): WorkspaceDecision {
  if (workspaces.length === 0) {
    return { action: "create" };
  }

  if (persistedId) {
    const persisted = workspaces.find(
      (workspace) => workspace.id === persistedId,
    );
    if (persisted) {
      return { action: "use", workspace: persisted };
    }
  }

  if (workspaces.length === 1) {
    return { action: "use", workspace: workspaces[0] };
  }

  return { action: "choose", workspaces };
}
