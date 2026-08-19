import axios from "axios";
import { asTrimmedString, isRecord } from "@/lib/utils/unknown";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly fields?: Record<string, string>;
  readonly retryAfter?: number;

  constructor(
    message: string,
    status: number,
    options?: {
      code?: string;
      fields?: Record<string, string>;
      retryAfter?: number;
    },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = options?.code;
    this.fields = options?.fields;
    this.retryAfter = options?.retryAfter;
  }
}

const STATUS_MESSAGES: Record<number, string> = {
  400: "Request could not be completed.",
  401: "Invalid email or password.",
  403: "You do not have permission to do that.",
  404: "The requested resource was not found.",
  409: "This email is already registered.",
  410: "This link has expired.",
  422: "Please check the highlighted fields.",
  429: "Too many attempts. Please try again later.",
  500: "Something went wrong. Please try again.",
  502: "The connected database could not be reached.",
};

type FastApiViolation = {
  loc?: Array<string | number>;
  msg?: string;
  message?: string;
};

function fieldFromLocation(
  loc: Array<string | number> | undefined,
): string | undefined {
  if (!loc?.length) {
    return undefined;
  }
  const last = loc[loc.length - 1];
  return typeof last === "string" ? last : undefined;
}

function parseFields(data: unknown): Record<string, string> | undefined {
  if (!isRecord(data)) {
    return undefined;
  }

  const fields: Record<string, string> = {};

  if (isRecord(data.fields)) {
    for (const [key, value] of Object.entries(data.fields)) {
      const message = asTrimmedString(value);
      if (message) {
        fields[key] = message;
      }
    }
  }

  const detail = data.detail;
  if (Array.isArray(detail)) {
    for (const item of detail) {
      if (!isRecord(item)) {
        continue;
      }
      const violation = item as FastApiViolation;
      const field = fieldFromLocation(violation.loc);
      const message =
        asTrimmedString(violation.msg) ?? asTrimmedString(violation.message);
      if (field && message) {
        fields[field] = message;
      }
    }
  }

  return Object.keys(fields).length ? fields : undefined;
}

function parseMessage(data: unknown, status: number): string {
  if (isRecord(data)) {
    if (isRecord(data.error)) {
      const nested = asTrimmedString(data.error.message);
      if (nested) {
        return sanitizeMessage(nested);
      }
    }

    const direct =
      asTrimmedString(data.message) ?? asTrimmedString(data.detail);
    if (direct) {
      return sanitizeMessage(direct);
    }

    if (Array.isArray(data.detail)) {
      const first = data.detail[0];
      if (isRecord(first)) {
        const message =
          asTrimmedString(first.msg) ?? asTrimmedString(first.message);
        if (message) {
          return sanitizeMessage(message);
        }
      }
    }
  }

  return STATUS_MESSAGES[status] ?? STATUS_MESSAGES[500];
}

function parseCode(data: unknown): string | undefined {
  if (!isRecord(data)) {
    return undefined;
  }
  if (isRecord(data.error)) {
    return asTrimmedString(data.error.code);
  }
  return asTrimmedString(data.code);
}

function sanitizeMessage(message: string): string {
  if (
    /traceback|stack trace|sqlalchemy|psycopg|internal server/i.test(message)
  ) {
    return STATUS_MESSAGES[500];
  }
  return message;
}

export function messageForStatus(status: number, fallback?: string): string {
  if (status === 401 && fallback) {
    return fallback;
  }
  return STATUS_MESSAGES[status] ?? fallback ?? STATUS_MESSAGES[500];
}

export function getErrorStatus(error: unknown): number | undefined {
  if (error instanceof ApiError) {
    return error.status;
  }
  if (axios.isAxiosError(error)) {
    return error.response?.status;
  }
  return undefined;
}

function parseRetryAfter(headers: unknown): number | undefined {
  if (!headers || typeof headers !== "object") {
    return undefined;
  }

  const record = headers as {
    get?: (name: string) => unknown;
    "retry-after"?: unknown;
    "Retry-After"?: unknown;
  };
  const raw =
    (typeof record.get === "function"
      ? record.get("retry-after")
      : undefined) ??
    record["retry-after"] ??
    record["Retry-After"];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string" && typeof value !== "number") {
    return undefined;
  }
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds < 0) {
    return undefined;
  }
  return Math.round(seconds);
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;
    const fields = parseFields(data);
    const retryAfter = parseRetryAfter(error.response?.headers);

    if (!error.response) {
      return new ApiError(
        "Unable to reach the server. Check your connection.",
        0,
      );
    }

    return new ApiError(parseMessage(data, status), status, {
      code: parseCode(data),
      fields,
      retryAfter,
    });
  }

  if (error instanceof Error && error.message) {
    return new ApiError(error.message, 0);
  }

  return new ApiError(STATUS_MESSAGES[500], 500);
}

export function isExpiredTokenError(error: unknown): boolean {
  const apiError = toApiError(error);
  if (apiError.status === 410) {
    return true;
  }
  return /expired|invalid token|token is invalid/i.test(apiError.message);
}
