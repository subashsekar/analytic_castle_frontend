import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useLogout } from "@/features/auth/hooks/use-auth-mutations";
import { hasSession, setSession } from "@/lib/auth/session";
import type { ReactNode } from "react";

vi.mock("@/features/auth/api", () => ({
  logoutRequest: vi.fn().mockRejectedValue(new Error("already invalid")),
}));

describe("useLogout", () => {
  it("clears the local session even if logout fails", async () => {
    setSession({ access_token: "access", refresh_token: "refresh" });

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });

    const { result } = renderHook(() => useLogout(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    await result.current.mutateAsync();

    await waitFor(() => {
      expect(hasSession()).toBe(false);
    });
  });
});
