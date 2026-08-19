import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { dataSourceErrorMessage } from "@/features/data-sources/errors";

describe("dataSourceErrorMessage", () => {
  it("maps 429 with Retry-After", () => {
    expect(
      dataSourceErrorMessage(
        new ApiError("Too many requests", 429, { retryAfter: 12 }),
      ),
    ).toBe("Too many requests. Try again in 12 seconds.");
  });

  it("maps 429 without Retry-After", () => {
    expect(dataSourceErrorMessage(new ApiError("Too many requests", 429))).toBe(
      "Too many requests. Try again shortly.",
    );
  });

  it("maps 403 and 404 without confirming the resource exists", () => {
    expect(dataSourceErrorMessage(new ApiError("Not authorized", 403))).toBe(
      "You do not have permission to do that.",
    );
    expect(
      dataSourceErrorMessage(new ApiError("Data source not found", 404)),
    ).toBe("Data source not found.");
  });

  it("keeps 409 and 400 detail text", () => {
    expect(
      dataSourceErrorMessage(new ApiError("Unable to save data source", 409)),
    ).toBe("Unable to save data source");
    expect(
      dataSourceErrorMessage(new ApiError("Unsupported connector type", 400)),
    ).toBe("Unsupported connector type");
  });
});
