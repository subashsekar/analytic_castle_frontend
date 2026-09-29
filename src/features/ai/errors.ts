import { toApiError } from "@/lib/api/errors";

const RATE_LIMIT_MESSAGE = "Too many requests. Try again shortly.";

function withRequestId(message: string, requestId?: string): string {
  if (!requestId) {
    return message;
  }
  return `${message} (Request ID: ${requestId})`;
}

export function isConversationConflict(error: unknown): boolean {
  const apiError = toApiError(error);
  if (apiError.status === 409) {
    return true;
  }
  if (apiError.status === 400) {
    const detail = apiError.message.toLowerCase();
    return (
      detail.includes("version conflict") ||
      detail.includes("not active") ||
      detail.includes("inactive")
    );
  }
  return false;
}

export function aiErrorMessage(error: unknown): string {
  const apiError = toApiError(error);
  const lowered = apiError.message.toLowerCase();

  if (
    apiError.status === 0 &&
    (lowered.includes("abort") ||
      lowered.includes("cancel") ||
      lowered.includes("interrupted"))
  ) {
    return "The analysis was interrupted. Try again.";
  }

  if (apiError.status === 401) {
    return withRequestId(
      "Your session expired. Sign in again.",
      apiError.requestId,
    );
  }

  if (apiError.status === 429) {
    if (apiError.retryAfter && apiError.retryAfter > 0) {
      return withRequestId(
        `Too many requests. Try again in ${apiError.retryAfter} seconds.`,
        apiError.requestId,
      );
    }
    return withRequestId(RATE_LIMIT_MESSAGE, apiError.requestId);
  }

  if (apiError.status === 403) {
    return withRequestId(
      "You don't have permission to use the AI Analyst.",
      apiError.requestId,
    );
  }

  if (apiError.status === 404) {
    const detail = apiError.message.toLowerCase();
    if (detail.includes("conversation")) {
      return withRequestId("Conversation not found.", apiError.requestId);
    }
    return withRequestId("Data source not found.", apiError.requestId);
  }

  if (apiError.status === 409 || isConversationConflict(error)) {
    return withRequestId(
      "This conversation changed elsewhere. Refresh and try again.",
      apiError.requestId,
    );
  }

  if (apiError.status === 422) {
    return withRequestId(
      apiError.message || "Please check your message and try again.",
      apiError.requestId,
    );
  }

  if (apiError.status === 400) {
    return withRequestId(
      apiError.message || "AI request is invalid.",
      apiError.requestId,
    );
  }

  if (apiError.status === 503) {
    return withRequestId(
      "The analyst is temporarily unavailable.",
      apiError.requestId,
    );
  }

  if (apiError.status === 504) {
    return withRequestId(
      "The analysis timed out. The server may still be working — wait a moment and try again.",
      apiError.requestId,
    );
  }

  if (apiError.status === 502) {
    return withRequestId(
      "The analysis was interrupted. Try again.",
      apiError.requestId,
    );
  }

  return withRequestId(
    apiError.message || "We couldn't complete that analysis.",
    apiError.requestId,
  );
}

export function conversationErrorMessage(error: unknown): string {
  const apiError = toApiError(error);

  if (apiError.status === 401) {
    return withRequestId(
      "Your session expired. Sign in again.",
      apiError.requestId,
    );
  }
  if (apiError.status === 403) {
    return withRequestId(
      "You don't have permission to use the AI Analyst.",
      apiError.requestId,
    );
  }
  if (apiError.status === 404) {
    return withRequestId("Conversation not found.", apiError.requestId);
  }
  if (apiError.status === 409) {
    return withRequestId(
      "This conversation changed elsewhere. Refresh and try again.",
      apiError.requestId,
    );
  }
  if (apiError.status === 429) {
    return withRequestId(RATE_LIMIT_MESSAGE, apiError.requestId);
  }
  if (apiError.status === 503) {
    return withRequestId(
      "The analyst is temporarily unavailable.",
      apiError.requestId,
    );
  }
  if (apiError.status >= 500) {
    return withRequestId(
      "We couldn't load your conversations.",
      apiError.requestId,
    );
  }
  return withRequestId(
    apiError.message || "We couldn't load your conversations.",
    apiError.requestId,
  );
}
