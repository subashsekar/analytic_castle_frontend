"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { postAuthPath } from "@/features/auth/post-auth-path";
import { decideWorkspace } from "@/features/workspace/workspace-decision";
import { getWorkspaceId, hasSession, setWorkspaceId } from "@/lib/auth/session";
import { isSafeNextPath } from "@/lib/constants/routes";
import { PageSpinner } from "@/components/ui/spinner";
import { Alert } from "@/components/ui/alert";

export function ProtectedGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, me, error } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated" && !hasSession()) {
      const next =
        pathname && pathname !== "/login"
          ? `?next=${encodeURIComponent(pathname)}`
          : "";
      router.replace(`/login${next}`);
    }
  }, [pathname, router, status]);

  if (status === "loading") {
    return <PageSpinner label="Restoring session" />;
  }

  if (status === "unauthenticated") {
    return <PageSpinner label="Redirecting to login" />;
  }

  if (error && !me) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <Alert>
          Your profile could not be loaded. Refresh the page or sign in again.
        </Alert>
      </div>
    );
  }

  return children;
}

export function GuestGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, me } = useAuth();

  useEffect(() => {
    if (status !== "authenticated" || !me) {
      return;
    }

    const next = searchParams.get("next");
    if (isSafeNextPath(next)) {
      router.replace(next);
      return;
    }

    router.replace(postAuthPath(me, getWorkspaceId()));
  }, [me, router, searchParams, status]);

  if (status === "loading") {
    return <PageSpinner label="Checking session" />;
  }

  if (status === "authenticated") {
    return <PageSpinner label="Redirecting" />;
  }

  return children;
}

export function WorkspaceGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { me, status } = useAuth();

  useEffect(() => {
    if (status !== "authenticated" || !me) {
      return;
    }

    const decision = decideWorkspace(
      me.workspaces,
      getWorkspaceId() ?? me.workspace?.id ?? null,
    );

    if (
      decision.action === "use" &&
      getWorkspaceId() !== decision.workspace.id
    ) {
      setWorkspaceId(decision.workspace.id);
    }

    const onCreate = pathname.startsWith("/workspace/new");
    const onSelect = pathname.startsWith("/workspace/select");
    const onOrganizations = pathname.startsWith("/organizations");
    const skipWorkspace =
      pathname.startsWith("/profile") || pathname.startsWith("/account");

    if (
      decision.action === "create" &&
      !onCreate &&
      !onOrganizations &&
      !skipWorkspace
    ) {
      router.replace("/workspace/new");
      return;
    }

    if (decision.action === "choose" && !onSelect && !onCreate) {
      router.replace("/workspace/select");
      return;
    }

    if (decision.action === "use" && (onCreate || onSelect)) {
      router.replace("/home");
    }
  }, [me, pathname, router, status]);

  return children;
}
