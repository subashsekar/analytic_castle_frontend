import { describe, expect, it } from "vitest";
import { deriveDataAvailability, deriveDataHealth } from "./product-status";

describe("deriveDataAvailability", () => {
  it("maps SUCCESS + schemas -> available", () => {
    const value = deriveDataAvailability({
      metadataEnabled: true,
      connectionStatus: "ACTIVE",
      isTesting: false,
      syncStatus: "SUCCESS",
      hasSchemas: true,
      schemasCount: 10,
    });
    expect(value).toBe("available");
  });

  it("maps RUNNING/PENDING -> checking", () => {
    const value = deriveDataAvailability({
      metadataEnabled: true,
      connectionStatus: "ACTIVE",
      isTesting: false,
      syncStatus: "RUNNING",
      hasSchemas: undefined,
      schemasCount: null,
    });
    expect(value).toBe("checking");
  });

  it("maps connection error -> unavailable", () => {
    const value = deriveDataAvailability({
      metadataEnabled: true,
      connectionStatus: "ERROR",
      isTesting: false,
      syncStatus: "SUCCESS",
      hasSchemas: true,
      schemasCount: 10,
    });
    expect(value).toBe("unavailable");
  });

  it("maps FAILED + schemas -> degraded", () => {
    const value = deriveDataAvailability({
      metadataEnabled: true,
      connectionStatus: "ACTIVE",
      isTesting: false,
      syncStatus: "FAILED",
      hasSchemas: true,
      schemasCount: 10,
    });
    expect(value).toBe("degraded");
  });
});

describe("deriveDataHealth", () => {
  it("maps SUCCESS + schemas -> healthy", () => {
    const value = deriveDataHealth({
      metadataEnabled: true,
      connectionStatus: "ACTIVE",
      syncStatus: "SUCCESS",
      hasSchemas: true,
    });
    expect(value).toBe("healthy");
  });

  it("maps RUNNING -> checking", () => {
    const value = deriveDataHealth({
      metadataEnabled: true,
      connectionStatus: "ACTIVE",
      syncStatus: "RUNNING",
      hasSchemas: true,
    });
    expect(value).toBe("checking");
  });

  it("maps FAILED + schemas -> degraded", () => {
    const value = deriveDataHealth({
      metadataEnabled: true,
      connectionStatus: "ACTIVE",
      syncStatus: "FAILED",
      hasSchemas: true,
    });
    expect(value).toBe("degraded");
  });

  it("maps inactive connection -> unavailable", () => {
    const value = deriveDataHealth({
      metadataEnabled: true,
      connectionStatus: "INACTIVE",
      syncStatus: "SUCCESS",
      hasSchemas: true,
    });
    expect(value).toBe("unavailable");
  });
});

