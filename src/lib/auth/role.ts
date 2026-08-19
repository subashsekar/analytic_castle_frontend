import {
  ROLES,
  USER_ROLES,
  WORKSPACE_ROLES,
  type Role,
  type UserRole,
  type WorkspaceRole,
} from "@/types/common";

export function asRole(value: unknown): Role | null {
  return typeof value === "string" &&
    (ROLES as readonly string[]).includes(value)
    ? (value as Role)
    : null;
}

export function asUserRole(value: unknown): UserRole | null {
  return typeof value === "string" &&
    (USER_ROLES as readonly string[]).includes(value)
    ? (value as UserRole)
    : null;
}

export function asWorkspaceRole(value: unknown): WorkspaceRole | null {
  return typeof value === "string" &&
    (WORKSPACE_ROLES as readonly string[]).includes(value)
    ? (value as WorkspaceRole)
    : null;
}
