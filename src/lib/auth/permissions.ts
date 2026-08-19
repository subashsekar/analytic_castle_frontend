import type { MeResponse } from "@/types/api";
import {
  PERMISSIONS,
  type Permission,
  type Role,
  type User,
} from "@/types/common";

export type PermissionContext = {
  role: Role | null;
  permissions: Permission[];
  is_super_admin: boolean;
};

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [...PERMISSIONS],
  OWNER: [
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
  ],
  ADMIN: [
    "org.read",
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
    "ai.settings",
  ],
  MEMBER: [
    "org.read",
    "connection.use",
    "data_source:read",
    "data_source:test",
    "analysis.run",
    "dashboard.view",
    "report.view",
  ],
  USER: [
    "org.read",
    "connection.use",
    "data_source:read",
    "data_source:test",
    "analysis.run",
    "dashboard.view",
    "report.view",
  ],
};

const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super admin",
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
  USER: "User",
};

export function roleLabel(role: Role | string | null | undefined): string {
  if (!role) {
    return "Member";
  }
  if (role in ROLE_LABELS) {
    return ROLE_LABELS[role as Role];
  }
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function permissionContextFromMe(
  me: MeResponse | null,
): PermissionContext {
  return {
    role:
      me?.workspace_role ??
      me?.organization?.role ??
      (me?.user.is_super_admin ? "SUPER_ADMIN" : (me?.user.role ?? null)),
    permissions: me?.permissions ?? [],
    is_super_admin: me?.user.is_super_admin ?? false,
  };
}

export function can(
  context: PermissionContext | User | null,
  permission: Permission,
): boolean {
  if (!context) {
    return false;
  }

  if ("email" in context) {
    if (context.is_super_admin) {
      return true;
    }
    return false;
  }

  if (context.permissions.includes(permission)) {
    return true;
  }

  if (context.is_super_admin) {
    return true;
  }

  if (context.role) {
    return ROLE_PERMISSIONS[context.role]?.includes(permission) ?? false;
  }

  return permission === "workspace.create" || permission === "workspace.admin";
}
