import { api } from "@/lib/api/client";
import { normalizeWorkspaceMember, unwrapList } from "@/lib/api/normalize";
import { workspacePaths } from "@/lib/api/paths";
import type { WorkspaceMember, WorkspaceRole } from "@/types/common";

export type AddWorkspaceMemberRequest = {
  user_id: string;
  role: Exclude<WorkspaceRole, "OWNER">;
};

export type UpdateWorkspaceMemberRequest = {
  role: WorkspaceRole;
};

export async function listWorkspaceMembers(
  workspaceId: string,
): Promise<WorkspaceMember[]> {
  const { data } = await api.get(workspacePaths.members(workspaceId));
  return unwrapList(data).map(normalizeWorkspaceMember);
}

export async function addWorkspaceMember(
  workspaceId: string,
  payload: AddWorkspaceMemberRequest,
): Promise<WorkspaceMember> {
  const { data } = await api.post(workspacePaths.members(workspaceId), payload);
  return normalizeWorkspaceMember(data);
}

export async function updateWorkspaceMember(
  workspaceId: string,
  userId: string,
  payload: UpdateWorkspaceMemberRequest,
): Promise<WorkspaceMember> {
  const { data } = await api.patch(
    workspacePaths.member(workspaceId, userId),
    payload,
  );
  return normalizeWorkspaceMember(data);
}

export async function removeWorkspaceMember(
  workspaceId: string,
  userId: string,
): Promise<void> {
  await api.delete(workspacePaths.member(workspaceId, userId));
}
