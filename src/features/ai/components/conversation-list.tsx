"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import type { Conversation } from "@/features/ai/types";

function formatUpdatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function conversationLabel(conversation: Conversation): string {
  if (conversation.message_count <= 0) {
    return "New conversation";
  }
  return `Conversation · ${conversation.message_count} message${
    conversation.message_count === 1 ? "" : "s"
  }`;
}

export function ConversationList({
  conversations,
  selectedId,
  loading,
  error,
  creating,
  onSelect,
  onCreate,
  onRetry,
}: {
  conversations: Conversation[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
  creating: boolean;
  onSelect: (conversationId: string) => void;
  onCreate: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-text-3">
          Session history
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onCreate}
          disabled={creating}
          loading={creating}
          aria-label="New conversation"
        >
          <Plus size={14} strokeWidth={1.6} aria-hidden />
          New
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-2 p-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : null}

        {error ? (
          <div className="space-y-3 p-2">
            <Alert>{error}</Alert>
            <Button variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          </div>
        ) : null}

        {!loading && !error && conversations.length === 0 ? (
          <div className="px-2 py-6 text-center">
            <p className="text-[13.5px] font-semibold text-text-1">
              Start a conversation
            </p>
            <p className="mt-1 text-[12.5px] text-text-3">
              Ask your AI Analyst a question about the data available in your
              workspace.
            </p>
          </div>
        ) : null}

        {!loading && !error
          ? conversations.map((conversation) => {
              const active = conversation.conversation_id === selectedId;
              return (
                <button
                  key={conversation.conversation_id}
                  type="button"
                  className={`ac-focus-ring mb-1 w-full rounded-sm border px-3 py-2.5 text-left transition-colors ${
                    active
                      ? "border-signal/30 bg-signal-tint"
                      : "border-transparent hover:bg-sunken"
                  }`}
                  aria-current={active ? "true" : undefined}
                  onClick={() => onSelect(conversation.conversation_id)}
                >
                  <span className="block truncate text-[13px] font-semibold text-text-1">
                    {conversationLabel(conversation)}
                  </span>
                  <span className="mt-0.5 block text-[11.5px] text-text-3">
                    {formatUpdatedAt(conversation.updated_at)}
                  </span>
                </button>
              );
            })
          : null}
      </div>
    </div>
  );
}
