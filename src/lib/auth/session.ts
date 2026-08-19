const ACCESS_TOKEN_KEY = "ac.access_token";
const REFRESH_TOKEN_KEY = "ac.refresh_token";
const WORKSPACE_KEY = "ac.workspace_id";
export const SESSION_COOKIE = "ac_session";

type SessionTokens = {
  access_token: string;
  refresh_token: string;
};

const listeners = new Set<() => void>();

function emitSessionChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

function read(key: string): string | null {
  if (!canUseStorage()) {
    return null;
  }
  return window.localStorage.getItem(key);
}

function write(key: string, value: string | null): void {
  if (!canUseStorage()) {
    return;
  }
  if (value === null) {
    window.localStorage.removeItem(key);
    return;
  }
  window.localStorage.setItem(key, value);
}

function setSessionCookie(present: boolean): void {
  if (typeof document === "undefined") {
    return;
  }

  if (present) {
    document.cookie = `${SESSION_COOKIE}=1; Path=/; SameSite=Lax`;
    return;
  }

  document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getAccessToken(): string | null {
  return read(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return read(REFRESH_TOKEN_KEY);
}

export function hasSession(): boolean {
  return Boolean(getAccessToken() || getRefreshToken());
}

export function setSession(tokens: SessionTokens): void {
  write(ACCESS_TOKEN_KEY, tokens.access_token);
  write(REFRESH_TOKEN_KEY, tokens.refresh_token);
  setSessionCookie(true);
  emitSessionChange();
}

export function clearSession(): void {
  write(ACCESS_TOKEN_KEY, null);
  write(REFRESH_TOKEN_KEY, null);
  write(WORKSPACE_KEY, null);
  setSessionCookie(false);
  emitSessionChange();
}

export function getWorkspaceId(): string | null {
  return read(WORKSPACE_KEY);
}

export function setWorkspaceId(workspaceId: string | null): void {
  write(WORKSPACE_KEY, workspaceId);
  emitSessionChange();
}
