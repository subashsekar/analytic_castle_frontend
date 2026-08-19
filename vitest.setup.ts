import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { clearSession } from "@/lib/auth/session";

afterEach(() => {
  cleanup();
  clearSession();
  window.localStorage.clear();
});
