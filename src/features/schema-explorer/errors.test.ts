import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { metadataErrorMessage } from "@/features/schema-explorer/errors";

describe("metadataErrorMessage", () => {
  it("maps 429 with Retry-After", () => {
    expect(
      metadataErrorMessage(
        new ApiError("Too many requests", 429, { retryAfter: 8 }),
      ),
    ).toBe("Too many requests. Try again in 8 seconds.");
  });

  it("maps permission and missing metadata states", () => {
    expect(metadataErrorMessage(new ApiError("Not authorized", 403))).toBe(
      "You do not have permission to do that.",
    );
    expect(metadataErrorMessage(new ApiError("Table not found", 404))).toBe(
      "Table not found",
    );
    expect(metadataErrorMessage(new ApiError("Schema not found", 404))).toBe(
      "Schema not found",
    );
    expect(
      metadataErrorMessage(new ApiError("Data source not found", 404)),
    ).toBe("Data source not found.");
  });

  it("maps sync conflict and customer-database failures", () => {
    expect(
      metadataErrorMessage(
        new ApiError("Metadata synchronization is already running", 409),
      ),
    ).toBe("Sync already running");
    expect(
      metadataErrorMessage(new ApiError("Unable to retrieve sample data", 502)),
    ).toBe("Data temporarily unavailable.");
    expect(
      metadataErrorMessage(
        new ApiError("Metadata synchronization failed", 502),
      ),
    ).toBe("Data temporarily unavailable.");
  });
});
