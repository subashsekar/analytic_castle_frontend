"use client";

import { useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/features/auth/api";
import { queryKeys } from "@/lib/query/query-keys";
import { hasSession, subscribeSession } from "@/lib/auth/session";

export function useCurrentUser() {
  const sessionExists = useSyncExternalStore(
    subscribeSession,
    hasSession,
    () => false,
  );

  return useQuery({
    queryKey: queryKeys.me,
    queryFn: getCurrentUser,
    enabled: sessionExists,
    staleTime: 60 * 1000,
  });
}
