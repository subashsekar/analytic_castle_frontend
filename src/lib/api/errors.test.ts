import axios from "axios";
import { describe, expect, it } from "vitest";
import { ApiError, isExpiredTokenError, toApiError } from "@/lib/api/errors";

function axiosError(
  status: number,
  data: unknown,
  headers: Record<string, string> = {},
) {
  return new axios.AxiosError(
    "Request failed",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    {
      status,
      data,
      statusText: "Error",
      headers,
      config: { headers: {} },
    } as never,
  );
}

describe("toApiError", () => {
  it("maps FastAPI detail strings", () => {
    const error = toApiError(
      axiosError(401, { detail: "Invalid credentials" }),
    );
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(401);
    expect(error.message).toBe("Invalid credentials");
  });

  it("maps documented error envelopes", () => {
    const error = toApiError(
      axiosError(409, {
        error: { code: "EMAIL_TAKEN", message: "Email already registered" },
      }),
    );
    expect(error.message).toBe("Email already registered");
    expect(error.code).toBe("EMAIL_TAKEN");
  });

  it("maps 422 field errors", () => {
    const error = toApiError(
      axiosError(422, {
        detail: [{ loc: ["body", "email"], msg: "Invalid email" }],
      }),
    );
    expect(error.fields?.email).toBe("Invalid email");
  });

  it("hides stack traces", () => {
    const error = toApiError(
      axiosError(500, { detail: "Traceback (most recent call last)" }),
    );
    expect(error.message).toBe("Something went wrong. Please try again.");
  });

  it("detects expired tokens", () => {
    expect(isExpiredTokenError(new ApiError("Token has expired", 400))).toBe(
      true,
    );
    expect(isExpiredTokenError(new ApiError("Gone", 410))).toBe(true);
    expect(isExpiredTokenError(new ApiError("Nope", 400))).toBe(false);
  });

  it("reads Retry-After from 429 responses", () => {
    const error = toApiError(
      axiosError(429, { detail: "Too many requests" }, { "retry-after": "8" }),
    );
    expect(error.status).toBe(429);
    expect(error.retryAfter).toBe(8);
    expect(error.message).toBe("Too many requests");
  });

  it("maps 502 customer-database failures", () => {
    const error = toApiError(
      axiosError(502, { detail: "Unable to retrieve sample data" }),
    );
    expect(error.status).toBe(502);
    expect(error.message).toBe("Unable to retrieve sample data");
  });
});
