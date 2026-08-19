import { describe, expect, it } from "vitest";
import { can, roleLabel } from "@/lib/auth/permissions";

describe("permissions", () => {
  it("uses backend permissions when present", () => {
    expect(
      can(
        {
          role: "USER",
          permissions: ["workspace.admin"],
          is_super_admin: false,
        },
        "workspace.admin",
      ),
    ).toBe(true);
  });

  it("falls back to role defaults", () => {
    expect(
      can(
        { role: "OWNER", permissions: [], is_super_admin: false },
        "workspace.admin",
      ),
    ).toBe(true);
    expect(
      can(
        { role: "USER", permissions: [], is_super_admin: false },
        "workspace.admin",
      ),
    ).toBe(false);
    expect(
      can(
        { role: "MEMBER", permissions: [], is_super_admin: false },
        "workspace.create",
      ),
    ).toBe(false);
  });

  it("treats super admins as permitted", () => {
    expect(
      can({ role: null, permissions: [], is_super_admin: true }, "org.write"),
    ).toBe(true);
  });

  it("uses backend data source permissions by workspace role", () => {
    expect(
      can(
        { role: "OWNER", permissions: [], is_super_admin: false },
        "data_source:create",
      ),
    ).toBe(true);
    expect(
      can(
        { role: "ADMIN", permissions: [], is_super_admin: false },
        "data_source:delete",
      ),
    ).toBe(true);
    expect(
      can(
        { role: "MEMBER", permissions: [], is_super_admin: false },
        "data_source:read",
      ),
    ).toBe(true);
    expect(
      can(
        { role: "MEMBER", permissions: [], is_super_admin: false },
        "data_source:test",
      ),
    ).toBe(true);
    expect(
      can(
        { role: "MEMBER", permissions: [], is_super_admin: false },
        "data_source:create",
      ),
    ).toBe(false);
    expect(
      can(
        { role: "MEMBER", permissions: [], is_super_admin: false },
        "data_source:delete",
      ),
    ).toBe(false);
    expect(
      can(
        { role: "MEMBER", permissions: [], is_super_admin: false },
        "data_source:update",
      ),
    ).toBe(false);
  });

  it("renders human-readable role labels", () => {
    expect(roleLabel("SUPER_ADMIN")).toBe("Super admin");
    expect(roleLabel("USER")).toBe("User");
    expect(roleLabel("MEMBER")).toBe("Member");
    expect(roleLabel("OWNER")).toBe("Owner");
  });
});
