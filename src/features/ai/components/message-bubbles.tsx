"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { hasPhase8Analysis } from "@/features/ai/api";
import { stripComposedMetadata } from "@/features/ai/answer-body";
import { AnalysisReport } from "@/features/ai/components/analysis/analysis-report";
import { AnalystContent } from "@/features/ai/components/analyst-content";
import { FollowUpSuggestions } from "@/features/ai/components/follow-up-suggestions";
import type { AIChatResponse, ChatTurn, ConversationMessage } from "@/features/ai/types";

export function UserMessage({ content }: { content: string }) {
  return (
    <div className="ac-msg-enter ml-auto max-w-[min(520px,85%)] rounded-[14px_14px_4px_14px] bg-signal px-4 py-3 text-[13.5px] leading-normal text-white">
      {content}
    </div>
  );
}

function needsClarification(response?: AIChatResponse): boolean {
  if (!response) {
    return false;
  }
  return Boolean(
    response.intent.requires_clarification ||
      response.plan.requires_clarification ||
      response.metadata_context.requires_clarification,
  );
}

export function AnalystMessage({
  content,
  response,
  error,
  followUps = [],
  onFollowUp,
  onRetry,
  sending = false,
  dataSourceId,
  isNewMessage = false,
}: {
  content: string;
  response?: AIChatResponse;
  error?: string;
  followUps?: string[];
  onFollowUp?: (value: string) => void;
  onRetry?: () => void;
  sending?: boolean;
  dataSourceId?: string | null;
  isNewMessage?: boolean;
}) {
  if (error) {
    return (
      <div className="flex max-w-[min(720px,85%)] items-start gap-3">
        <AnalystAvatar />
        <div className="min-w-0 flex-1 rounded-[4px_14px_14px_14px] border border-border bg-surface px-4 py-3">
          <Alert>{error}</Alert>
          {onRetry ? (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={onRetry}
              disabled={sending}
            >
              Try again
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  const clarification =
    response?.intent.clarification_question ||
    response?.plan.clarification_question ||
    response?.metadata_context.clarification_question;
  const clarificationDistinct =
    clarification &&
    clarification.trim().toLowerCase() !== content.trim().toLowerCase()
      ? clarification
      : null;

  const resolvedDataSourceId =
    dataSourceId || response?.metadata_context.data_source_id || null;

  const clarifying = needsClarification(response);
  const analysis = response?.analysis;
  const showAnalysis = !clarifying && hasPhase8Analysis(analysis);
  // Clarifications / failures: short message only — never dump composed metadata.
  const displayText = clarifying
    ? content
    : showAnalysis
      ? content
      : stripComposedMetadata(content) || content;

  return (
    <div className="ac-msg-enter flex w-full max-w-[min(720px,85%)] items-start gap-3">
      <AnalystAvatar />
      <div className="min-w-0 max-w-full flex-1 overflow-hidden rounded-[4px_14px_14px_14px] border border-border bg-surface px-4 py-3">
        {clarifying ? (
          <div className="space-y-3">
            <AnalystContent
              text={displayText}
              dataSourceId={resolvedDataSourceId}
              isNewMessage={isNewMessage}
            />
            <Alert>
              More detail is needed before analysis can finish.
              {clarificationDistinct ? ` ${clarificationDistinct}` : ""}
            </Alert>
          </div>
        ) : showAnalysis && analysis ? (
          <AnalysisReport
            analysis={analysis}
            narrative={content}
            metadata={response?.metadata_context}
          />
        ) : (
          <AnalystContent
            text={displayText}
            dataSourceId={resolvedDataSourceId}
            isNewMessage={isNewMessage}
          />
        )}
        {!clarifying && clarificationDistinct ? (
          <p className="mt-3 border-t border-border pt-3 text-[12.5px] text-text-2">
            <span className="font-semibold text-text-1">Needs clarification: </span>
            {clarificationDistinct}
          </p>
        ) : null}
        {response?.plan.unsupported ? (
          <p className="mt-3 text-[12.5px] text-warning">
            This request is not supported yet.
          </p>
        ) : null}
        {onFollowUp ? (
          <FollowUpSuggestions
            suggestions={followUps}
            disabled={sending}
            onSelect={onFollowUp}
          />
        ) : null}
      </div>
    </div>
  );
}

export function AnalystAvatar() {
  return (
    <span
      className="flex size-[30px] shrink-0 items-center justify-center rounded-[9px] bg-ink-950 text-[11px] font-bold text-signal-dark-text"
      aria-hidden
    >
      AC
    </span>
  );
}

export function PersistedMessage({
  message,
  hideSystem = true,
  dataSourceId,
}: {
  message: ConversationMessage;
  hideSystem?: boolean;
  dataSourceId?: string | null;
}) {
  if (message.role === "user") {
    return <UserMessage content={message.content} />;
  }
  if (message.role === "assistant") {
    return <AnalystMessage content={message.content} dataSourceId={dataSourceId} />;
  }
  if (hideSystem) {
    return null;
  }
  return (
    <p className="text-center text-[12px] text-text-3">{message.content}</p>
  );
}

export function TransientTurn({
  turn,
  followUps,
  onFollowUp,
  onRetry,
  sending,
  dataSourceId,
}: {
  turn: ChatTurn;
  followUps?: string[];
  onFollowUp?: (value: string) => void;
  onRetry?: () => void;
  sending?: boolean;
  dataSourceId?: string | null;
}) {
  if (turn.role === "user") {
    return <UserMessage content={turn.content} />;
  }
  return (
    <AnalystMessage
      content={turn.content}
      response={turn.response}
      error={turn.error}
      followUps={followUps}
      onFollowUp={onFollowUp}
      onRetry={onRetry}
      sending={sending}
      dataSourceId={dataSourceId}
      isNewMessage={Boolean(turn.pending)}
    />
  );
}
