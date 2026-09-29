import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AIAnalystPage } from "@/features/ai/components/ai-analyst-page";
import { ApiError } from "@/lib/api/errors";
import { renderWithQuery } from "@/test/render";
import type { Permission } from "@/types/common";

const listDataSources = vi.fn();
const listConversations = vi.fn();
const createConversation = vi.fn();
const updateConversation = vi.fn();
const getConversation = vi.fn();
const listConversationMessages = vi.fn();
const sendAIChat = vi.fn();

let workspaceId = "ws-1";
let permissions: Permission[] = ["data_source:read"];

vi.mock("@/features/auth/hooks/use-auth", () => ({
  useAuth: () => ({
    workspace: workspaceId
      ? { id: workspaceId, name: "Main", organization_id: "org-1" }
      : null,
    can: (permission: Permission) => permissions.includes(permission),
  }),
}));

vi.mock("@/features/data-sources/api", () => ({
  listDataSources: (...args: unknown[]) => listDataSources(...args),
}));

vi.mock("@/features/ai/api", async () => {
  const actual = await vi.importActual<typeof import("@/features/ai/api")>(
    "@/features/ai/api",
  );
  return {
    ...actual,
    listConversations: (...args: unknown[]) => listConversations(...args),
    createConversation: (...args: unknown[]) => createConversation(...args),
    updateConversation: (...args: unknown[]) => updateConversation(...args),
    getConversation: (...args: unknown[]) => getConversation(...args),
    listConversationMessages: (...args: unknown[]) =>
      listConversationMessages(...args),
    sendAIChat: (...args: unknown[]) => sendAIChat(...args),
  };
});

const source = {
  id: "ds-1",
  workspace_id: "ws-1",
  name: "Analytics DB",
  type: "POSTGRESQL",
  status: "ACTIVE",
  created_by: "user-1",
  created_at: "2026-08-16T10:00:00Z",
  updated_at: "2026-08-16T10:00:00Z",
  last_tested_at: "2026-08-16T10:00:00Z",
};

const conversation = {
  conversation_id: "c-1",
  user_id: "u-1",
  workspace_id: "ws-1",
  organization_id: "org-1",
  data_source_id: "ds-1",
  status: "ACTIVE",
  message_count: 2,
  char_count: 50,
  conversation_version: 2,
  agent_version: 2,
  started_at: "2026-09-03T10:00:00Z",
  updated_at: "2026-09-03T10:05:00Z",
  error_message: null,
};

const chatResponse = {
  request_id: "req-1",
  response: "Orders links to customers on customer_id.",
  model: "gpt-4o-mini",
  usage: null,
  intent: {
    type: "SCHEMA_QUESTION",
    operation: null,
    subject: "orders",
    metrics: [],
    dimensions: [],
    filters: [],
    time_range: null,
    sort: null,
    requested_limit: null,
    safe_limit: null,
    exceeds_limit: false,
    requires_data_access: false,
    requires_metadata: true,
    confidence: "HIGH",
    requires_clarification: true,
    clarification_question: "Which time range should I use?",
  },
  plan: {
    requires_clarification: true,
    clarification_question: "Which time range should I use?",
    operations: ["METADATA_LOOKUP"],
    required_capabilities: ["METADATA"],
    requires_metadata: true,
    requires_database: false,
    requires_sample_data: false,
    requires_aggregation: false,
    requires_time_filter: false,
    requires_relationships: true,
    unsupported: false,
  },
  metadata_context: {
    data_source_id: "ds-1",
    tables: [
      {
        table_id: "t-1",
        schema_name: "public",
        table_name: "orders",
        match_reason: "exact",
        relevance_score: 100,
      },
    ],
    columns: [],
    relationships: [],
    unresolved_concepts: [],
    requires_clarification: false,
    clarification_question: null,
  },
  conversation_id: "c-1",
  conversation_version: 3,
};

describe("AIAnalystPage", () => {
  beforeEach(() => {
    workspaceId = "ws-1";
    permissions = ["data_source:read"];
    listDataSources.mockReset();
    listConversations.mockReset();
    createConversation.mockReset();
    updateConversation.mockReset();
    listConversationMessages.mockReset();
    getConversation.mockReset();
    sendAIChat.mockReset();

    listDataSources.mockResolvedValue([source]);
    listConversations.mockResolvedValue({
      items: [conversation],
      page: 1,
      page_size: 50,
      total: 1,
    });
    getConversation.mockImplementation(async () => ({
      ...conversation,
      conversation_version: chatResponse.conversation_version ?? 3,
      agent_version: 4,
    }));
    listConversationMessages.mockResolvedValue({
      items: [
        {
          role: "user",
          content: "How do orders relate?",
          message_id: "m-1",
        },
        {
          role: "assistant",
          content: "Orders links to customers on customer_id.",
          message_id: "m-2",
        },
      ],
      page: 1,
      page_size: 100,
      total: 2,
    });
    createConversation.mockResolvedValue({
      ...conversation,
      conversation_id: "c-new",
      message_count: 0,
      conversation_version: 1,
      agent_version: 1,
    });
    updateConversation.mockResolvedValue({
      ...conversation,
      status: "COMPLETED",
    });
    sendAIChat.mockResolvedValue(chatResponse);
  });

  it("blocks unauthorized users", async () => {
    permissions = [];
    renderWithQuery(<AIAnalystPage />);
    expect(
      await screen.findByText(
        /don't have permission to use the AI Analyst/i,
      ),
    ).toBeTruthy();
  });

  it("shows empty starter state and conversation list", async () => {
    listConversations.mockResolvedValue({
      items: [],
      page: 1,
      page_size: 50,
      total: 0,
    });
    renderWithQuery(<AIAnalystPage />);
    expect(
      await screen.findByText(/Ask me anything about/i),
    ).toBeTruthy();
    expect(screen.getByText(/Start a conversation/i)).toBeTruthy();
    expect(screen.getAllByText("Analytics DB").length).toBeGreaterThan(0);
  });

  it("creates a conversation from New", async () => {
    const user = userEvent.setup();
    renderWithQuery(<AIAnalystPage />);
    await screen.findByText(/Ask me anything about/i);
    await user.click(screen.getByRole("button", { name: /new conversation/i }));
    await waitFor(() => {
      expect(createConversation).toHaveBeenCalledWith("ws-1", {
        data_source_id: "ds-1",
      });
    });
  });

  it("loads messages when selecting a conversation", async () => {
    const user = userEvent.setup();
    renderWithQuery(<AIAnalystPage />);
    await screen.findByText(/Conversation · 2 messages/i);
    await user.click(screen.getByText(/Conversation · 2 messages/i));
    expect(
      await screen.findByText("How do orders relate?"),
    ).toBeTruthy();
    expect(
      screen.getByText("Orders links to customers on customer_id."),
    ).toBeTruthy();
  });

  it("sends a message and shows follow-up from clarification", async () => {
    const user = userEvent.setup();
    listConversations.mockResolvedValue({
      items: [],
      page: 1,
      page_size: 50,
      total: 0,
    });
    listConversationMessages.mockResolvedValue({
      items: [
        { role: "user", content: "Relate orders", message_id: "m-1" },
        {
          role: "assistant",
          content: chatResponse.response,
          message_id: "m-2",
        },
      ],
      page: 1,
      page_size: 100,
      total: 2,
    });

    renderWithQuery(<AIAnalystPage />);
    await screen.findByText(/Ask me anything about/i);
    const input = screen.getByLabelText(/Ask the AI Analyst/i);
    await user.type(input, "Relate orders");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(sendAIChat).toHaveBeenCalled();
    });
    expect(
      await screen.findByText(/Which time range should I use/i),
    ).toBeTruthy();
    expect(screen.queryByText(/MCP|list_tables|sample_rows/i)).toBeNull();
  });

  it("prevents duplicate sends while analyzing", async () => {
    const user = userEvent.setup();
    let resolveChat: ((value: typeof chatResponse) => void) | undefined;
    sendAIChat.mockImplementation(
      () =>
        new Promise<typeof chatResponse>((resolve) => {
          resolveChat = resolve;
        }),
    );
    listConversations.mockResolvedValue({
      items: [],
      page: 1,
      page_size: 50,
      total: 0,
    });

    renderWithQuery(<AIAnalystPage />);
    await screen.findByText(/Ask me anything about/i);
    const input = screen.getByLabelText(/Ask the AI Analyst/i);
    await user.type(input, "First question");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/Analyzing/i)).toBeTruthy();
    expect(sendAIChat).toHaveBeenCalledTimes(1);
    expect(
      (screen.getByRole("button", { name: /send message/i }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);

    resolveChat?.(chatResponse);
    await waitFor(() => {
      expect(screen.queryByText(/Analyzing/i)).toBeNull();
    });
  });

  it("shows conversation load failure without raw backend details", async () => {
    listConversations.mockRejectedValue(new ApiError("Not authorized", 403));
    renderWithQuery(<AIAnalystPage />);
    expect(
      await screen.findByText(/don't have permission to use the AI Analyst/i),
    ).toBeTruthy();
  });

  it("does not keep prior workspace conversations after workspace switch", async () => {
    const { rerender } = renderWithQuery(<AIAnalystPage />);
    await screen.findByText(/Conversation · 2 messages/i);

    workspaceId = "ws-2";
    listDataSources.mockResolvedValue([
      { ...source, id: "ds-2", workspace_id: "ws-2", name: "Other DB" },
    ]);
    listConversations.mockResolvedValue({
      items: [],
      page: 1,
      page_size: 50,
      total: 0,
    });
    rerender(<AIAnalystPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Conversation · 2 messages/i)).toBeNull();
    });
    expect(await screen.findByText(/Start a conversation/i)).toBeTruthy();
  });
});
