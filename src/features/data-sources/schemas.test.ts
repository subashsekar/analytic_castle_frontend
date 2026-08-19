import { describe, expect, it } from "vitest";
import {
  dataSourceFormErrors,
  dataSourceNameErrors,
  validatePort,
} from "@/features/data-sources/schemas";

describe("data source validation", () => {
  it("requires connection fields", () => {
    const errors = dataSourceFormErrors({
      name: "",
      host: "",
      port: "",
      database_name: "",
      username: "",
      password: "",
      ssl_mode: "require",
    });

    expect(errors.name).toBe("Name is required.");
    expect(errors.host).toBe("Host is required.");
    expect(errors.port).toBe("Port is required.");
    expect(errors.database_name).toBe("Database is required.");
    expect(errors.username).toBe("Username is required.");
    expect(errors.password).toBe("Password is required.");
  });

  it("rejects an invalid port", () => {
    expect(validatePort("abc")).toBe("Port must be a valid number.");
    expect(validatePort("0")).toBe("Port must be between 1 and 65535.");
    expect(validatePort("65536")).toBe("Port must be between 1 and 65535.");
    expect(validatePort("5432")).toBeUndefined();
  });

  it("rejects an unknown SSL mode", () => {
    const errors = dataSourceFormErrors({
      name: "Analytics",
      host: "db.example.com",
      port: "5432",
      database_name: "analytics",
      username: "reader",
      password: "secret",
      ssl_mode: "not-a-mode",
    });
    expect(errors.ssl_mode).toBe("Select a valid SSL mode.");
  });

  it("validates rename independently of credentials", () => {
    expect(dataSourceNameErrors({ name: "" }).name).toBe("Name is required.");
    expect(dataSourceNameErrors({ name: "Analytics" }).name).toBeUndefined();
  });
});
