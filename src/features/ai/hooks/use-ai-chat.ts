"use client";

import { useMutation } from "@tanstack/react-query";
import { sendAIChat } from "@/features/ai/api";
import type { AIChatRequest } from "@/features/ai/types";

export function useAIChat() {
  return useMutation({
    mutationFn: ({
      payload,
      signal,
    }: {
      payload: AIChatRequest;
      signal?: AbortSignal;
    }) => sendAIChat(payload, { signal }),
    gcTime: 0,
  });
}
