/** Platform user roles from the API. */
export const USER_ROLES = ["SUPER_ADMIN", "ADMIN", "USER"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Workspace membership roles from the API. */
export const WORKSPACE_ROLES = ["OWNER", "ADMIN", "MEMBER"] as const;
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

/** Roles used for UI permission checks (user + workspace). */
export const ROLES = [
  "SUPER_ADMIN",
  "OWNER",
  "ADMIN",
  "MEMBER",
  "USER",
] as const;

export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  "org.read",
  "org.write",
  "member.invite",
  "member.role_change",
  "workspace.create",
  "workspace.admin",
  "connection.manage",
  "connection.use",
  "data_source:read",
  "data_source:create",
  "data_source:update",
  "data_source:delete",
  "data_source:test",
  "dataset.manage",
  "semantic.edit",
  "analysis.run",
  "cleaning.approve",
  "dashboard.create",
  "dashboard.view",
  "report.create",
  "report.view",
  "audit.read",
  "usage.read",
  "ai.settings",
  "support.grant.approve",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export type User = {
  id: string;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  role: UserRole | null;
  email_verified: boolean;
  is_active: boolean;
  is_super_admin: boolean;
};

export type Organization = {
  id: string;
  name: string;
  slug?: string | null;
  role?: Role | null;
  plan_code?: string | null;
};

export type Workspace = {
  id: string;
  name: string;
  organization_id?: string | null;
  slug?: string | null;
  is_default?: boolean;
};

export type WorkspaceMember = {
  id: string;
  workspace_id: string | null;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  role: WorkspaceRole | null;
  created_at: string | null;
};
