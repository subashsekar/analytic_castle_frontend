"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Eraser, ShieldAlert } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useDataSources } from "@/features/data-sources/hooks/use-data-sources";
import { dataSourceTypeLabel } from "@/features/data-sources/components/data-source-status";
import { useAIChat } from "@/features/ai/hooks/use-ai-chat";
import {
  useClearConversation,
  useConversations,
  useCreateConversation,
} from "@/features/ai/hooks/use-conversations";
import { useConversationMessages } from "@/features/ai/hooks/use-conversation-messages";
import {
  aiErrorMessage,
  conversationErrorMessage,
  isConversationConflict,
} from "@/features/ai/errors";
import { getConversation } from "@/features/ai/api";
import type { AIChatResponse, ChatTurn } from "@/features/ai/types";
import { AnalystStatus } from "@/features/ai/components/analyst-status";
import { ClearConversationDialog } from "@/features/ai/components/clear-conversation-dialog";
import { ContextPanel } from "@/features/ai/components/context-panel";
import { ConversationList } from "@/features/ai/components/conversation-list";
import { FollowUpSuggestions } from "@/features/ai/components/follow-up-suggestions";
import { MessageInput } from "@/features/ai/components/message-input";
import {
  AnalystAvatar,
  PersistedMessage,
  TransientTurn,
} from "@/features/ai/components/message-bubbles";
import { QueryHistory } from "@/features/ai/components/query-history";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSpinner } from "@/components/ui/spinner";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/lib/query/query-keys";

function newTurnId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `turn-${Date.now().toString(16)}`;
}

function extractFollowUps(response: AIChatResponse | undefined): string[] {
  if (!response) {
    return [];
  }
  const clarification =
    response.intent.clarification_question ||
    response.plan.clarification_question ||
    response.metadata_context.clarification_question;
  return clarification ? [clarification] : [];
}

const STARTER_PROMPTS = [
  "Which tables look related to customers?",
  "What columns exist on orders?",
  "Summarize the available catalog for this source.",
] as const;

export function AIAnalystPage() {
  const { workspace, can } = useAuth();
  const canRead = can("data_source:read");
  const workspaceId = workspace?.id ?? null;
  const queryClient = useQueryClient();
  const sourcesQuery = useDataSources(workspaceId);
  const conversationsQuery = useConversations(workspaceId);
  const createConversation = useCreateConversation(workspaceId);
  const clearConversation = useClearConversation(workspaceId);
  const chat = useAIChat();

  const [selection, setSelection] = useState({
    workspaceId: "",
    dataSourceId: "",
  });
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [conversationWorkspaceId, setConversationWorkspaceId] = useState("");
  const [draft, setDraft] = useState("");
  const [transientTurns, setTransientTurns] = useState<ChatTurn[]>([]);
  const [latestResponse, setLatestResponse] = useState<AIChatResponse | null>(
    null,
  );
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(
    null,
  );
  const [mobileTab, setMobileTab] = useState<"chat" | "sources">("chat");
  const [sidebarTab, setSidebarTab] = useState<"conversations" | "queries">("conversations");
  const [clearOpen, setClearOpen] = useState(false);
  /** Fresh versions from last chat/get — do not wait only on list refetch. */
  const [liveVersions, setLiveVersions] = useState<{
    conversationId: string | null;
    conversationVersion: number | null;
    agentVersion: number | null;
  }>({
    conversationId: null,
    conversationVersion: null,
    agentVersion: null,
  });
  const threadRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [rateLimitTimeLeft, setRateLimitTimeLeft] = useState<number>(0);

  useEffect(() => {
    const checkRateLimit = () => {
      const resetTimeStr = localStorage.getItem("rate_limit_reset");
      if (resetTimeStr) {
        const resetTime = Number(resetTimeStr);
        const timeLeft = Math.max(0, Math.ceil((resetTime - Date.now()) / 1000));
        setRateLimitTimeLeft(timeLeft);
      } else {
        setRateLimitTimeLeft(0);
      }
    };

    checkRateLimit();
    const interval = setInterval(checkRateLimit, 1000);

    const handleTrigger = () => {
      checkRateLimit();
    };

    window.addEventListener("rate_limit_triggered", handleTrigger);
    return () => {
      clearInterval(interval);
      window.removeEventListener("rate_limit_triggered", handleTrigger);
    };
  }, []);

  const sources = sourcesQuery.data ?? [];
  const selectedDataSourceId =
    selection.workspaceId === (workspaceId ?? "")
      ? selection.dataSourceId
      : "";
  const dataSourceId =
    selectedDataSourceId ||
    (sources.length === 1 && sources[0] ? sources[0].id : "");
  const selectedSource =
    sources.find((item) => item.id === dataSourceId) ?? null;

  const activeConversationId =
    conversationWorkspaceId === (workspaceId ?? "")
      ? selectedConversationId
      : null;

  const messagesQuery = useConversationMessages(
    workspaceId,
    activeConversationId,
  );

  const conversations = useMemo(() => {
    const items = conversationsQuery.data?.items ?? [];
    if (!dataSourceId) {
      return items;
    }
    return items.filter(
      (item) => !item.data_source_id || item.data_source_id === dataSourceId,
    );
  }, [conversationsQuery.data?.items, dataSourceId]);

  const selectedConversation =
    conversations.find(
      (item) => item.conversation_id === activeConversationId,
    ) ?? null;

  const conversationVersion =
    liveVersions.conversationId === activeConversationId &&
    liveVersions.conversationVersion != null
      ? liveVersions.conversationVersion
      : (selectedConversation?.conversation_version ?? null);

  const agentVersion =
    liveVersions.conversationId === activeConversationId &&
    liveVersions.agentVersion != null
      ? liveVersions.agentVersion
      : (selectedConversation?.agent_version ?? null);

  const persistedMessages = useMemo(
    () => messagesQuery.data?.items ?? [],
    [messagesQuery.data?.items],
  );
  const sending = chat.isPending;

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setTransientTurns([]);
    setLatestResponse(null);
    setLastFailedMessage(null);
    setSelectedConversationId(null);
    setConversationWorkspaceId(workspaceId ?? "");
    setLiveVersions({
      conversationId: null,
      conversationVersion: null,
      agentVersion: null,
    });
    setDraft("");
    setMobileTab("chat");
  }, [workspaceId]);

  useEffect(() => {
    const node = threadRef.current;
    if (!node) {
      return;
    }
    node.scrollTop = node.scrollHeight;
  }, [persistedMessages, transientTurns, sending]);

  useEffect(() => {
    if (transientTurns.length === 0 || !latestResponse) {
      return;
    }
    if (messagesQuery.isFetching || messagesQuery.isLoading) {
      return;
    }
    const hasAssistant = persistedMessages.some(
      (message) =>
        message.role === "assistant" &&
        message.content === latestResponse.response,
    );
    if (hasAssistant) {
      setTransientTurns((current) =>
        current.some((turn) => turn.error) ? current : [],
      );
    }
  }, [
    latestResponse,
    messagesQuery.isFetching,
    messagesQuery.isLoading,
    persistedMessages,
    transientTurns.length,
  ]);

  function focusInput() {
    window.setTimeout(() => {
      const textarea = document.getElementById(
        "ai-analyst-message",
      ) as HTMLTextAreaElement | null;
      textarea?.focus();
    }, 0);
  }

  async function syncConversationState(
    workspace: string,
    conversationId: string,
  ) {
    const detail = await getConversation(workspace, conversationId);
    setLiveVersions({
      conversationId: detail.conversation_id,
      conversationVersion: detail.conversation_version,
      agentVersion: detail.agent_version,
    });
    queryClient.setQueryData(
      queryKeys.conversation(workspace, conversationId),
      detail,
    );
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations(workspace),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversationMessages(workspace, conversationId),
      }),
    ]);
    return detail;
  }

  async function handleCreateConversation() {
    if (!workspaceId || !dataSourceId || createConversation.isPending) {
      return;
    }
    abortRef.current?.abort();
    try {
      const created = await createConversation.mutateAsync({
        data_source_id: dataSourceId,
      });
      setConversationWorkspaceId(workspaceId);
      setSelectedConversationId(created.conversation_id);
      setLiveVersions({
        conversationId: created.conversation_id,
        conversationVersion: created.conversation_version,
        agentVersion: created.agent_version,
      });
      setTransientTurns([]);
      setLatestResponse(null);
      setLastFailedMessage(null);
      setMobileTab("chat");
      focusInput();
    } catch {
      // Error surfaced via createConversation.isError below.
    }
  }

  async function sendMessage(rawMessage: string) {
    const message = rawMessage.trim();
    if (!message || !dataSourceId || !workspaceId || sending) {
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userTurn: ChatTurn = {
      id: newTurnId(),
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };
    setTransientTurns((current) => [...current, userTurn]);
    setDraft("");
    setLastFailedMessage(null);

    const conversationId = activeConversationId;

    try {
      const response = await chat.mutateAsync({
        payload: {
          message,
          data_source_id: dataSourceId,
          conversation_id: conversationId,
          conversation_version: conversationVersion,
        },
        signal: controller.signal,
      });

      if (controller.signal.aborted) {
        return;
      }

      const nextConversationId =
        response.conversation_id ?? conversationId ?? null;
      setLatestResponse(response);
      setTransientTurns([
        userTurn,
        {
          id: newTurnId(),
          role: "assistant",
          content: response.response,
          createdAt: new Date().toISOString(),
          response,
        },
      ]);

      if (nextConversationId) {
        setConversationWorkspaceId(workspaceId);
        setSelectedConversationId(nextConversationId);
        // Apply chat-returned context version immediately for the next turn.
        setLiveVersions((current) => ({
          conversationId: nextConversationId,
          conversationVersion:
            response.conversation_version ?? current.conversationVersion,
          agentVersion: current.agentVersion,
        }));
        // Sessions remain ACTIVE after planning — refresh agent_version via GET.
        await syncConversationState(workspaceId, nextConversationId);
      }
    } catch (error) {
      if (controller.signal.aborted) {
        setTransientTurns((current) =>
          current.filter((turn) => turn.id !== userTurn.id),
        );
        return;
      }

      if (isConversationConflict(error) && workspaceId && conversationId) {
        try {
          await syncConversationState(workspaceId, conversationId);
        } catch {
          // Keep conflict message if refresh also fails.
        }
      }

      setLastFailedMessage(message);
      setTransientTurns((current) => [
        ...current.filter((turn) => turn.id !== userTurn.id),
        userTurn,
        {
          id: newTurnId(),
          role: "assistant",
          content: "",
          createdAt: new Date().toISOString(),
          error: aiErrorMessage(error),
        },
      ]);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }

  function handleSelectConversation(conversationId: string) {
    if (conversationId === activeConversationId) {
      return;
    }
    abortRef.current?.abort();
    const selected = conversations.find(
      (item) => item.conversation_id === conversationId,
    );
    setConversationWorkspaceId(workspaceId ?? "");
    setSelectedConversationId(conversationId);
    setLiveVersions({
      conversationId,
      conversationVersion: selected?.conversation_version ?? null,
      agentVersion: selected?.agent_version ?? null,
    });
    setTransientTurns([]);
    setLatestResponse(null);
    setLastFailedMessage(null);
    setMobileTab("chat");
  }

  async function handleClearConversation() {
    if (!workspaceId || !selectedConversation) {
      return;
    }
    const expectedAgentVersion =
      agentVersion ?? selectedConversation.agent_version;
    if (expectedAgentVersion == null) {
      return;
    }
    abortRef.current?.abort();
    try {
      await clearConversation.mutateAsync({
        conversationId: selectedConversation.conversation_id,
        payload: {
          status: "COMPLETED",
          expected_agent_version: expectedAgentVersion,
        },
      });
      setClearOpen(false);
      setSelectedConversationId(null);
      setLiveVersions({
        conversationId: null,
        conversationVersion: null,
        agentVersion: null,
      });
      setTransientTurns([]);
      setLatestResponse(null);
      setLastFailedMessage(null);
      focusInput();
    } catch (error) {
      if (
        isConversationConflict(error) &&
        workspaceId &&
        selectedConversation.conversation_id
      ) {
        try {
          await syncConversationState(
            workspaceId,
            selectedConversation.conversation_id,
          );
        } catch {
          // Surface original clear error via mutation state.
        }
      }
    }
  }

  if (!canRead) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-text-1">
          AI Analyst
        </h1>
        <Alert>You don&apos;t have permission to use the AI Analyst.</Alert>
      </div>
    );
  }

  if (sourcesQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <PageSpinner label="Loading data sources" />
      </div>
    );
  }

  if (sourcesQuery.isError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-text-1">
          AI Analyst
        </h1>
        <Alert>Data sources could not be loaded.</Alert>
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-text-1">
          AI Analyst
        </h1>
        <EmptyState
          title="Connect a data source first"
          description="AI Analyst needs an authorized workspace data source before it can analyze available catalog metadata."
          action={
            <Link
              href="/data-sources/new"
              className="ac-press inline-flex h-[38px] items-center justify-center rounded-sm bg-signal px-4 text-[13.5px] font-semibold text-white hover:bg-signal-hover"
            >
              Add data source
            </Link>
          }
        />
      </div>
    );
  }

  const followUps = extractFollowUps(latestResponse ?? undefined);
  const showEmptyThread =
    persistedMessages.length === 0 && transientTurns.length === 0 && !sending;
  const pendingSync = transientTurns.some((turn) => turn.response && !turn.error);
  const displayPersisted = (() => {
    if (!pendingSync || !latestResponse) {
      return persistedMessages;
    }
    let items = persistedMessages;
    const last = items[items.length - 1];
    if (
      last?.role === "assistant" &&
      last.content === latestResponse.response
    ) {
      items = items.slice(0, -1);
      const prev = items[items.length - 1];
      const optimisticUser = transientTurns.find((turn) => turn.role === "user");
      if (
        prev?.role === "user" &&
        optimisticUser &&
        prev.content === optimisticUser.content
      ) {
        items = items.slice(0, -1);
      }
    }
    return items;
  })();
  const conversationListError = conversationsQuery.isError
    ? conversationErrorMessage(conversationsQuery.error)
    : createConversation.isError
      ? aiErrorMessage(createConversation.error)
      : null;

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4">
      {rateLimitTimeLeft > 0 ? (
        <Alert tone="warning">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-amber-500 animate-pulse" />
            <span className="font-semibold">Too Many Requests. Rate limit exceeded. Backing off for {rateLimitTimeLeft} seconds...</span>
          </div>
        </Alert>
      ) : null}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-1">
            AI Analyst
          </h1>
          <p className="mt-1 text-[13px] text-text-3">
            Ask your AI Data Analyst a question about your workspace data.
          </p>
        </div>
        <div className="flex w-full max-w-md flex-col gap-2 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="ai-data-source"
              className="mb-1 block text-[11.5px] font-semibold uppercase tracking-[0.03em] text-text-3"
            >
              Data source
            </label>
            <Select
              id="ai-data-source"
              value={dataSourceId}
              onChange={(event) => {
                abortRef.current?.abort();
                setSelection({
                  workspaceId: workspaceId ?? "",
                  dataSourceId: event.target.value,
                });
                setSelectedConversationId(null);
                setLiveVersions({
                  conversationId: null,
                  conversationVersion: null,
                  agentVersion: null,
                });
                setTransientTurns([]);
                setLatestResponse(null);
              }}
            >
              <option value="">Select a data source</option>
              {sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name} · {dataSourceTypeLabel(source.type)}
                </option>
              ))}
            </Select>
          </div>
          {selectedConversation ? (
            <Button
              variant="outline"
              className="shrink-0"
              onClick={() => setClearOpen(true)}
              disabled={sending || clearConversation.isPending}
            >
              <Eraser size={15} strokeWidth={1.6} aria-hidden />
              End
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex gap-1 rounded-sm border border-border bg-sunken p-1 lg:hidden">
        {(
          [
            { id: "chat", label: "Chat" },
            { id: "sources", label: "Sources" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`ac-focus-ring flex-1 rounded-[6px] px-3 py-2 text-[13px] font-semibold ${
              mobileTab === tab.id
                ? "bg-surface text-signal shadow-sm"
                : "text-text-3"
            }`}
            onClick={() => setMobileTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section
          className={`flex min-h-[420px] flex-col overflow-hidden rounded-md border border-border bg-surface ${
            mobileTab === "chat" ? "flex" : "hidden lg:flex"
          }`}
          aria-label="AI Analyst conversation"
        >
          <div
            ref={threadRef}
            className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4 sm:px-5"
          >
            {showEmptyThread ? (
              <div className="my-auto flex flex-col items-start">
                <div className="flex max-w-[min(640px,100%)] items-start gap-3">
                  <AnalystAvatar />
                  <div className="rounded-[4px_14px_14px_14px] border border-border bg-surface px-4 py-3 text-[13.5px] leading-relaxed text-text-1">
                    Ask me anything about{" "}
                    <b>{selectedSource?.name ?? "your data source"}</b>.
                    <FollowUpSuggestions
                      suggestions={
                        dataSourceId ? [...STARTER_PROMPTS] : []
                      }
                      disabled={!dataSourceId || sending}
                      onSelect={(value) => {
                        void sendMessage(value);
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {messagesQuery.isLoading && activeConversationId ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-3/4" />
                <Skeleton className="ml-auto h-12 w-1/2" />
                <Skeleton className="h-20 w-4/5" />
              </div>
            ) : null}

            {messagesQuery.isError ? (
              <Alert>
                {conversationErrorMessage(messagesQuery.error)}
              </Alert>
            ) : null}

            {!messagesQuery.isLoading
              ? displayPersisted.map((message) => (
                  <PersistedMessage
                    key={message.message_id}
                    message={message}
                    dataSourceId={dataSourceId}
                  />
                ))
              : null}

            {transientTurns.map((turn, index) => (
              <TransientTurn
                key={turn.id}
                turn={turn}
                dataSourceId={dataSourceId}
                followUps={
                  index === transientTurns.length - 1 && turn.error
                    ? []
                    : followUps
                }
                sending={sending}
                onFollowUp={(value) => {
                  void sendMessage(value);
                }}
                onRetry={
                  turn.error && lastFailedMessage
                    ? () => {
                        setTransientTurns((current) =>
                          current.filter((item) => !item.error),
                        );
                        void sendMessage(lastFailedMessage);
                      }
                    : undefined
                }
              />
            ))}

            {sending ? (
              <AnalystStatus label="Analyzing… this can take up to a couple of minutes." />
            ) : null}

            {!sending &&
            followUps.length > 0 &&
            transientTurns.length === 0 &&
            persistedMessages.length > 0 ? (
              <div className="pl-[42px]">
                <FollowUpSuggestions
                  suggestions={followUps}
                  onSelect={(value) => {
                    void sendMessage(value);
                  }}
                />
              </div>
            ) : null}
          </div>

          <MessageInput
            value={draft}
            onChange={setDraft}
            onSend={() => {
              void sendMessage(draft);
            }}
            disabled={!dataSourceId}
            sending={sending}
            placeholder={
              dataSourceId
                ? persistedMessages.length > 0 || transientTurns.length > 0
                  ? "Ask a follow-up…"
                  : "Ask a question…"
                : "Select a data source to begin"
            }
            helper={selectedSource?.name}
          />
        </section>

        <aside
          className={`flex min-h-[320px] flex-col overflow-hidden rounded-md border border-border bg-surface ${
            mobileTab === "sources" ? "flex" : "hidden lg:flex"
          }`}
          aria-label="Sources and session history"
        >
          <div className="border-b border-border p-4">
            <ContextPanel
              selectedName={selectedSource?.name ?? null}
              response={latestResponse ?? undefined}
            />
          </div>

          <div className="flex border-b border-border bg-sunken/15 px-3 py-1.5 gap-2 shrink-0">
            <button
              onClick={() => setSidebarTab("conversations")}
              className={`ac-focus-ring flex-1 rounded-[4px] py-1 text-[11.5px] font-semibold transition-colors ${
                sidebarTab === "conversations"
                  ? "bg-surface text-text-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-border"
                  : "text-text-3 hover:text-text-2 border border-transparent"
              }`}
            >
              Conversations
            </button>
            <button
              onClick={() => setSidebarTab("queries")}
              className={`ac-focus-ring flex-1 rounded-[4px] py-1 text-[11.5px] font-semibold transition-colors ${
                sidebarTab === "queries"
                  ? "bg-surface text-text-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-border"
                  : "text-text-3 hover:text-text-2 border border-transparent"
              }`}
            >
              Query Logs
            </button>
          </div>

          <div className="min-h-0 flex-1">
            {sidebarTab === "conversations" ? (
              <ConversationList
                conversations={conversations}
                selectedId={activeConversationId}
                loading={conversationsQuery.isLoading}
                error={conversationListError}
                creating={createConversation.isPending}
                onSelect={handleSelectConversation}
                onCreate={() => {
                  void handleCreateConversation();
                }}
                onRetry={() => {
                  void conversationsQuery.refetch();
                }}
              />
            ) : (
              <QueryHistory
                workspaceId={workspaceId}
                dataSourceId={dataSourceId}
              />
            )}
          </div>
          {clearConversation.isError ? (
            <div className="border-t border-border p-3">
              <Alert>{aiErrorMessage(clearConversation.error)}</Alert>
            </div>
          ) : null}
        </aside>
      </div>

      <ClearConversationDialog
        open={clearOpen}
        clearing={clearConversation.isPending}
        onCancel={() => setClearOpen(false)}
        onConfirm={() => {
          void handleClearConversation();
        }}
      />
    </div>
  );
}
