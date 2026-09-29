import axios, { type InternalAxiosRequestConfig } from "axios";
import { toApiError } from "@/lib/api/errors";
import { authPaths } from "@/lib/api/paths";
import { getApiBaseUrl } from "@/lib/env";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setSession,
} from "@/lib/auth/session";
import { isTokenEnvelope } from "@/lib/api/normalize";

declare module "axios" {
  interface AxiosRequestConfig {
    skipAuthRefresh?: boolean;
    _retry?: boolean;
  }
}

type RetryableConfig = InternalAxiosRequestConfig;

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshInFlight: Promise<void> | null = null;

async function refreshAccessToken(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const { data } = await api.post(
    authPaths.refresh,
    { refresh_token: refreshToken },
    { skipAuthRefresh: true } as RetryableConfig,
  );

  if (!isTokenEnvelope(data)) {
    throw new Error("Invalid refresh response");
  }

  setSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });
}

function requestId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `req-${Date.now().toString(16)}`;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (!config.headers["X-Request-ID"]) {
    config.headers["X-Request-ID"] = requestId();
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetryableConfig | undefined;
    const status = error.response?.status;
    const url = config?.url ?? "";
    const isAuthEndpoint = /\/auth\/(login|register|refresh)$/.test(url);

    if (status === 429) {
      const retryAfter = error.response?.headers?.["retry-after"] || "30";
      const countdownSec = Number(retryAfter) || 30;
      const resetTime = Date.now() + countdownSec * 1000;
      localStorage.setItem("rate_limit_reset", String(resetTime));
      window.dispatchEvent(new CustomEvent("rate_limit_triggered", { detail: { resetTime } }));
    }

    if (status === 401 && config && !isAuthEndpoint) {
      if (!config.skipAuthRefresh && !config._retry && getRefreshToken()) {
        config._retry = true;

        try {
          if (!refreshInFlight) {
            refreshInFlight = refreshAccessToken().finally(() => {
              refreshInFlight = null;
            });
          }
          await refreshInFlight;
          return api(config);
        } catch {
          clearSession();
          return Promise.reject(toApiError(error));
        }
      }

      clearSession();
    }

    return Promise.reject(toApiError(error));
  },
);
