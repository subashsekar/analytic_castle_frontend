import { toApiError } from "@/lib/api/errors";

const RATE_LIMIT_MESSAGE = "Too many requests. Try again shortly.";

export function dataSourceErrorMessage(error: unknown): string {
  const apiError = toApiError(error);

  if (apiError.status === 429) {
    if (apiError.retryAfter && apiError.retryAfter > 0) {
      return `Too many requests. Try again in ${apiError.retryAfter} seconds.`;
    }
    return RATE_LIMIT_MESSAGE;
  }

  if (apiError.status === 403) {
    return "You do not have permission to do that.";
  }

  if (apiError.status === 404) {
    return "Data source not found.";
  }

  if (apiError.status === 401) {
    return apiError.message;
  }

  return apiError.message;
}
