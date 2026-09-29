import { api } from "@/lib/api/client";
import {
  buildMeResponse,
  isTokenEnvelope,
  normalizeUser,
} from "@/lib/api/normalize";
import { authPaths } from "@/lib/api/paths";
import { getRefreshToken, getWorkspaceId } from "@/lib/auth/session";
import {
  listOrganizations,
  listWorkspaces,
} from "@/features/workspace/api";
import { listWorkspaceMembers } from "@/features/team/api";
import type { AuthResponse, MeResponse, TokenEnvelope } from "@/types/api";
import type { User } from "@/types/common";
import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "@/features/auth/types";

export async function register(
  payload: RegisterRequest,
): Promise<{ user: User }> {
  const { data } = await api.post(authPaths.register, payload);
  return { user: normalizeUser(data) };
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const { data } = await api.post(authPaths.login, payload);
  if (!isTokenEnvelope(data)) {
    throw new Error("Login did not return a session.");
  }
  const record = data as TokenEnvelope & { user?: unknown; token_type?: string };
  return {
    access_token: record.access_token,
    refresh_token: record.refresh_token,
    token_type: record.token_type,
    user: record.user ? normalizeUser(record.user) : undefined,
  };
}

export async function refresh(refreshToken: string): Promise<AuthResponse> {
  const { data } = await api.post(
    authPaths.refresh,
    { refresh_token: refreshToken },
    { skipAuthRefresh: true },
  );
  if (!isTokenEnvelope(data)) {
    throw new Error("Refresh did not return a session.");
  }
  const record = data as TokenEnvelope & { user?: unknown; token_type?: string };
  return {
    access_token: record.access_token,
    refresh_token: record.refresh_token,
    token_type: record.token_type,
    user: record.user ? normalizeUser(record.user) : undefined,
  };
}

export async function logoutRequest(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return;
  }
  await api.post(
    authPaths.logout,
    { refresh_token: refreshToken },
    { skipAuthRefresh: true },
  );
}

async function resolveWorkspaceRole(
  userId: string,
  workspaceId: string | null | undefined,
) {
  if (!workspaceId) {
    return null;
  }
  try {
    const members = await listWorkspaceMembers(workspaceId);
    return (
      members.find((member) => member.user_id === userId)?.role ?? null
    );
  } catch {
    return null;
  }
}

export async function composeMe(user: User): Promise<MeResponse> {
  const organizations = await listOrganizations();
  const workspaceLists = await Promise.all(
    organizations.map((organization) => listWorkspaces(organization.id)),
  );
  const workspaces = workspaceLists.flat();
  const preferredWorkspaceId = getWorkspaceId();
  const activeWorkspace =
    workspaces.find((item) => item.id === preferredWorkspaceId) ??
    workspaces[0] ??
    null;
  const workspaceRole = await resolveWorkspaceRole(
    user.id,
    activeWorkspace?.id,
  );

  return buildMeResponse({
    user,
    organizations,
    workspaces,
    workspaceId: activeWorkspace?.id ?? preferredWorkspaceId,
    workspaceRole,
  });
}

export async function getCurrentUser(): Promise<MeResponse> {
  const { data } = await api.get(authPaths.me);
  return composeMe(normalizeUser(data));
}

export async function verifyEmail(payload: VerifyEmailRequest): Promise<void> {
  await api.post(authPaths.verifyEmail, payload);
}

export async function resendVerification(
  payload: ResendVerificationRequest,
): Promise<void> {
  await api.post(authPaths.resendVerification, payload);
}

/** OpenAPI alias of resend-verification. */
export async function sendVerificationEmail(
  payload: ResendVerificationRequest,
): Promise<void> {
  await api.post(authPaths.sendVerificationEmail, payload);
}

export async function forgotPassword(
  payload: ForgotPasswordRequest,
): Promise<void> {
  await api.post(authPaths.forgotPassword, payload);
}

export async function resetPassword(
  payload: ResetPasswordRequest,
): Promise<void> {
  await api.post(authPaths.resetPassword, payload);
}

export async function changePassword(
  payload: ChangePasswordRequest,
): Promise<void> {
  await api.post(authPaths.changePassword, payload);
}
