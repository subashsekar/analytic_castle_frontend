"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useLogout } from "@/features/auth/hooks/use-auth-mutations";
import { useSwitchWorkspace } from "@/features/workspace/hooks/use-workspaces";
import { getErrorStatus } from "@/lib/api/errors";
import {
  can as canPermission,
  permissionContextFromMe,
} from "@/lib/auth/permissions";
import {
  getWorkspaceId,
  hasSession,
  subscribeSession,
} from "@/lib/auth/session";
import type { MeResponse } from "@/types/api";
import type { Permission, User, Workspace } from "@/types/common";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  me: MeResponse | null;
  workspace: Workspace | null;
  error: Error | null;
  isVerified: boolean;
  can: (permission: Permission) => boolean;
  logout: () => Promise<void>;
  switchWorkspace: (workspace: Workspace) => Promise<void>;
  isSwitchingWorkspace: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const sessionExists = useSyncExternalStore(
    subscribeSession,
    hasSession,
    () => false,
  );
  const meQuery = useCurrentUser();
  const logoutMutation = useLogout();
  const switchMutation = useSwitchWorkspace();

  const me = meQuery.data ?? null;
  const unauthorized = getErrorStatus(meQuery.error) === 401;

  let status: AuthStatus = "loading";
  if (!sessionExists && !me) {
    status = "unauthenticated";
  } else if (meQuery.isPending && !me) {
    status = "loading";
  } else if (me) {
    status = "authenticated";
  } else if (unauthorized || (!sessionExists && meQuery.isError)) {
    status = "unauthenticated";
  } else if (meQuery.isError) {
    status = "authenticated";
  }

  const workspace =
    me?.workspaces.find((item) => item.id === getWorkspaceId()) ??
    me?.workspace ??
    null;

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const switchWorkspace = useCallback(
    async (next: Workspace) => {
      await switchMutation.mutateAsync({
        workspace: next,
      });
    },
    [switchMutation],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user: me?.user ?? null,
      me,
      workspace,
      error: meQuery.error instanceof Error ? meQuery.error : null,
      isVerified: me?.user.email_verified ?? false,
      can: (permission: Permission) =>
        canPermission(permissionContextFromMe(me), permission),
      logout,
      switchWorkspace,
      isSwitchingWorkspace: switchMutation.isPending,
    }),
    [
      logout,
      me,
      meQuery.error,
      status,
      switchMutation.isPending,
      switchWorkspace,
      workspace,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}
