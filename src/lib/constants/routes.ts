export const PUBLIC_AUTH_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
] as const;

export const TOKEN_AUTH_PATHS = ["/reset-password", "/verify-email"] as const;

export const PROTECTED_PREFIXES = [
  "/home",
  "/profile",
  "/account",
  "/workspace",
  "/data-sources",
] as const;

export function isSafeNextPath(
  value: string | null | undefined,
): value is string {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}
