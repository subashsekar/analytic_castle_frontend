import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import {
  unwrapList,
  normalizeOrganization,
  normalizeWorkspace,
} from "@/lib/api/normalize";
import { organizationPaths, workspacePaths } from "@/lib/api/paths";
import type { Organization, Workspace } from "@/types/common";
import type {
  CreateOrganizationRequest,
  CreateWorkspaceRequest,
  UpdateOrganizationRequest,
  UpdateWorkspaceRequest,
} from "@/features/workspace/types";

export async function listOrganizations(): Promise<Organization[]> {
  try {
    const { data } = await api.get(organizationPaths.root);
    return unwrapList(data)
      .map(normalizeOrganization)
      .filter((item): item is Organization => item !== null);
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 403)
    ) {
      return [];
    }
    throw error;
  }
}

export async function getOrganization(
  organizationId: string,
): Promise<Organization> {
  const { data } = await api.get(organizationPaths.byId(organizationId));
  const organization = normalizeOrganization(data);
  if (!organization) {
    throw new ApiError("Organization could not be loaded.", 500);
  }
  return organization;
}

export async function createOrganization(
  payload: CreateOrganizationRequest,
): Promise<Organization> {
  const { data } = await api.post(organizationPaths.root, payload);
  const organization = normalizeOrganization(data);
  if (!organization) {
    throw new ApiError(
      "Organization was created but the response was invalid.",
      500,
    );
  }
  return organization;
}

export async function updateOrganization(
  organizationId: string,
  payload: UpdateOrganizationRequest,
): Promise<Organization> {
  const { data } = await api.patch(
    organizationPaths.byId(organizationId),
    payload,
  );
  return (
    normalizeOrganization(data) ?? {
      id: organizationId,
      name: payload.name ?? "Organization",
    }
  );
}

export async function deleteOrganization(
  organizationId: string,
): Promise<void> {
  await api.delete(organizationPaths.byId(organizationId));
}

export async function listWorkspaces(
  organizationId: string,
): Promise<Workspace[]> {
  try {
    const { data } = await api.get(workspacePaths.root, {
      params: { organization_id: organizationId },
    });
    return unwrapList(data)
      .map(normalizeWorkspace)
      .filter((item): item is Workspace => item !== null);
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 403)
    ) {
      return [];
    }
    throw error;
  }
}

export async function getWorkspace(workspaceId: string): Promise<Workspace> {
  const { data } = await api.get(workspacePaths.byId(workspaceId));
  const workspace = normalizeWorkspace(data);
  if (!workspace) {
    throw new ApiError("Workspace could not be loaded.", 500);
  }
  return workspace;
}

export async function createWorkspace(
  payload: CreateWorkspaceRequest,
): Promise<Workspace> {
  const { data } = await api.post(workspacePaths.root, payload);
  const workspace = normalizeWorkspace(data);
  if (!workspace) {
    throw new ApiError(
      "Workspace was created but the response was invalid.",
      500,
    );
  }
  return workspace;
}

export async function updateWorkspace(
  workspaceId: string,
  payload: UpdateWorkspaceRequest,
): Promise<Workspace> {
  const { data } = await api.patch(workspacePaths.byId(workspaceId), payload);
  return (
    normalizeWorkspace(data) ?? {
      id: workspaceId,
      name: payload.name ?? "Workspace",
    }
  );
}

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  await api.delete(workspacePaths.byId(workspaceId));
}
