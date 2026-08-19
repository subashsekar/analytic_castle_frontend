import { asRole, asUserRole, asWorkspaceRole } from "@/lib/auth/role";
import { joinFullName, splitFullName } from "@/lib/utils/names";
import { asNonEmptyString, isRecord } from "@/lib/utils/unknown";
import type { MeResponse } from "@/types/api";
import type {
  Organization,
  User,
  Workspace,
  WorkspaceMember,
  WorkspaceRole,
} from "@/types/common";

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }
  if (isRecord(data) && Array.isArray(data.items)) {
    return data.items as T[];
  }
  return [];
}

export function normalizeUser(raw: unknown): User {
  const data = isRecord(raw) ? raw : {};
  const firstName = asNonEmptyString(data.first_name);
  const lastName = asNonEmptyString(data.last_name);
  const fullName =
    asNonEmptyString(data.full_name) ??
    (joinFullName(firstName, lastName) || null);
  const split = splitFullName(fullName);
  const role = asUserRole(data.role);

  return {
    id: asNonEmptyString(data.id) ?? "",
    email: asNonEmptyString(data.email) ?? "",
    full_name: fullName,
    first_name: firstName ?? split.first_name,
    last_name: lastName ?? split.last_name,
    role,
    email_verified: asBoolean(
      data.email_verified,
      asBoolean(data.is_verified, false),
    ),
    is_active: asBoolean(data.is_active, true),
    is_super_admin:
      asBoolean(data.is_super_admin, false) || role === "SUPER_ADMIN",
  };
}

export function normalizeOrganization(raw: unknown): Organization | null {
  if (!isRecord(raw) || !asNonEmptyString(raw.id)) {
    return null;
  }

  return {
    id: String(raw.id),
    name: asNonEmptyString(raw.name) ?? "Organization",
    slug: asNonEmptyString(raw.slug) ?? null,
    role: asRole(raw.role),
    plan_code: asNonEmptyString(raw.plan_code) ?? null,
  };
}

export function normalizeWorkspace(raw: unknown): Workspace | null {
  if (!isRecord(raw) || !asNonEmptyString(raw.id)) {
    return null;
  }

  return {
    id: String(raw.id),
    name: asNonEmptyString(raw.name) ?? "Workspace",
    organization_id: asNonEmptyString(raw.organization_id) ?? null,
    slug: asNonEmptyString(raw.slug) ?? null,
    is_default:
      typeof raw.is_default === "boolean" ? raw.is_default : undefined,
  };
}

export function normalizeWorkspaceMember(raw: unknown): WorkspaceMember {
  const data = isRecord(raw) ? raw : {};
  const firstName = asNonEmptyString(data.first_name);
  const lastName = asNonEmptyString(data.last_name);
  const fullName =
    asNonEmptyString(data.full_name) ??
    (joinFullName(firstName, lastName) || null);

  return {
    id: asNonEmptyString(data.id) ?? asNonEmptyString(data.user_id) ?? "",
    workspace_id: asNonEmptyString(data.workspace_id) ?? null,
    user_id: asNonEmptyString(data.user_id) ?? asNonEmptyString(data.id) ?? "",
    email: asNonEmptyString(data.email) ?? "",
    first_name: firstName ?? null,
    last_name: lastName ?? null,
    full_name: fullName,
    role: asWorkspaceRole(data.role),
    created_at: asNonEmptyString(data.created_at) ?? null,
  };
}

export function buildMeResponse(input: {
  user: User;
  organizations?: Organization[];
  workspaces?: Workspace[];
  workspaceId?: string | null;
  workspaceRole?: WorkspaceRole | null;
}): MeResponse {
  const organizations = input.organizations ?? [];
  const workspaces = input.workspaces ?? [];
  const workspace =
    workspaces.find((item) => item.id === input.workspaceId) ??
    workspaces[0] ??
    null;
  const organization =
    organizations.find((item) => item.id === workspace?.organization_id) ??
    organizations[0] ??
    null;

  const workspaceRole = input.workspaceRole ?? null;
  const organizationWithRole = organization
    ? { ...organization, role: workspaceRole ?? organization.role ?? null }
    : null;

  return {
    user: input.user,
    organization: organizationWithRole,
    workspace,
    organizations: organizationWithRole
      ? [
          organizationWithRole,
          ...organizations.filter((item) => item.id !== organizationWithRole.id),
        ]
      : organizations,
    workspaces: workspace
      ? [workspace, ...workspaces.filter((item) => item.id !== workspace.id)]
      : workspaces,
    workspace_role: workspaceRole,
    permissions: [],
  };
}

export function normalizeMe(raw: unknown): MeResponse {
  const data = isRecord(raw) ? raw : {};
  const userSource = isRecord(data.user) ? data.user : data;
  const user = normalizeUser(userSource);
  const organization = normalizeOrganization(data.organization);
  const workspace = normalizeWorkspace(data.workspace);
  const organizations = unwrapList(data.organizations)
    .map(normalizeOrganization)
    .filter((item): item is Organization => item !== null);
  const workspaces = unwrapList(data.workspaces)
    .map(normalizeWorkspace)
    .filter((item): item is Workspace => item !== null);
  const permissions = unwrapList<string>(data.permissions).filter(
    (item): item is MeResponse["permissions"][number] =>
      typeof item === "string",
  );
  const workspaceRole =
    asWorkspaceRole(data.workspace_role) ??
    asWorkspaceRole(organization?.role) ??
    null;

  const composed = buildMeResponse({
    user,
    organizations: organization
      ? [
          organization,
          ...organizations.filter((item) => item.id !== organization.id),
        ]
      : organizations,
    workspaces: workspace
      ? [workspace, ...workspaces.filter((item) => item.id !== workspace.id)]
      : workspaces,
    workspaceId: workspace?.id ?? null,
    workspaceRole,
  });

  return {
    ...composed,
    permissions,
  };
}

export function isTokenEnvelope(
  raw: unknown,
): raw is { access_token: string; refresh_token: string } {
  return Boolean(
    isRecord(raw) &&
      asNonEmptyString(raw.access_token) &&
      asNonEmptyString(raw.refresh_token),
  );
}
