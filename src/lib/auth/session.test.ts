import { describe, expect, it } from "vitest";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getWorkspaceId,
  hasSession,
  setSession,
  setWorkspaceId,
} from "@/lib/auth/session";

describe("session", () => {
  it("persists and restores tokens", () => {
    expect(hasSession()).toBe(false);

    setSession({ access_token: "access", refresh_token: "refresh" });

    expect(hasSession()).toBe(true);
    expect(getAccessToken()).toBe("access");
    expect(getRefreshToken()).toBe("refresh");
    expect(document.cookie).toContain("ac_session=1");
  });

  it("clears tokens, workspace, and the session cookie", () => {
    setSession({ access_token: "access", refresh_token: "refresh" });
    setWorkspaceId("ws-1");

    clearSession();

    expect(hasSession()).toBe(false);
    expect(getAccessToken()).toBeNull();
    expect(getWorkspaceId()).toBeNull();
    expect(document.cookie.includes("ac_session=1")).toBe(false);
  });
});
