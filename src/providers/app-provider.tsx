"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/features/auth/auth-provider";
import { QueryProvider } from "@/providers/query-provider";

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
}
