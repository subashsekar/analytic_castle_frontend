"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  changePassword,
  composeMe,
  forgotPassword,
  login,
  logoutRequest,
  register,
  resendVerification,
  resetPassword,
  verifyEmail,
} from "@/features/auth/api";
import { queryKeys } from "@/lib/query/query-keys";
import { clearSession, setSession } from "@/lib/auth/session";
import type { LoginRequest, RegisterRequest } from "@/features/auth/types";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginRequest) => login(payload),
    async onSuccess(data) {
      setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      if (data.user) {
        const me = await composeMe(data.user);
        queryClient.setQueryData(queryKeys.me, me);
      }
      await queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterRequest) => register(payload),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await logoutRequest();
      } catch {
        // Session may already be invalid; still clear the client.
      }
    },
    onSettled: async () => {
      clearSession();
      await queryClient.clear();
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => verifyEmail({ token }),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => resendVerification({ email }),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPassword({ email }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: { token: string; new_password: string }) =>
      resetPassword(payload),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  });
}
