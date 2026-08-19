import { decideWorkspace } from "@/features/workspace/workspace-decision";
import type { MeResponse } from "@/types/api";

export function postAuthPath(
  me: MeResponse,
  persistedWorkspaceId: string | null,
): string {
  const decision = decideWorkspace(
    me.workspaces,
    persistedWorkspaceId ?? me.workspace?.id ?? null,
  );

  if (decision.action === "create") {
    return "/workspace/new";
  }

  if (decision.action === "choose") {
    return "/workspace/select";
  }

  return "/home";
}