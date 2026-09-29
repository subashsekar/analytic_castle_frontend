import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api/client";
import { aiPaths, conversationPaths } from "@/lib/api/paths";
import {
  createConversation,
  listConversationMessages,
  listConversations,
  normalizeAIChatResponse,
  normalizeConversation,
  sendAIChat,
  updateConversation,
  appendConversationMessage,
} from "@/features/ai/api";
import { aiErrorMessage, conversationErrorMessage } from "@/features/ai/errors";
import { ApiError } from "@/lib/api/errors";

vi.mock("@/lib/api/client", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockedApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
};

const sampleResponse = {
  request_id: "req-1",
  response: "Customers looks related to orders via customer_id.",
  model: "gpt-4o-mini",
  usage: { input_tokens: 10, output_tokens: 20, total_tokens: 30 },
  intent: {
    type: "SCHEMA_QUESTION",
    operation: null,
    subject: "customers",
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
    requires_clarification: false,
    clarification_question: null,
  },
  plan: {
    requires_clarification: false,
    clarification_question: null,
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
    data_source_id: "11111111-1111-1111-1111-111111111111",
    tables: [
      {
        table_id: "22222222-2222-2222-2222-222222222222",
        schema_name: "public",
        table_name: "customers",
        match_reason: "exact",
        relevance_score: 100,
        primary_key_columns: [],
      },
    ],
    columns: [],
    relationships: [],
    resolved_metrics: [],
    resolved_dimensions: [],
    resolved_filters: [],
    resolved_time_columns: [],
    unresolved_concepts: [],
    requires_clarification: false,
    clarification_question: null,
  },
  conversation_id: "33333333-3333-3333-3333-333333333333",
  conversation_version: 2,
};

const sampleConversation = {
  conversation_id: "33333333-3333-3333-3333-333333333333",
  user_id: "u1",
  workspace_id: "ws-1",
  organization_id: "org-1",
  data_source_id: "11111111-1111-1111-1111-111111111111",
  status: "ACTIVE",
  message_count: 2,
  char_count: 40,
  conversation_version: 2,
  agent_version: 2,
  started_at: "2026-09-03T10:00:00Z",
  updated_at: "2026-09-03T10:05:00Z",
  error_message: null,
};

describe("AI chat API", () => {
  beforeEach(() => {
    mockedApi.get.mockReset();
    mockedApi.post.mockReset();
    mockedApi.patch.mockReset();
  });

  it("posts to /api/v1/ai/chat with conversation fields and normalizes", async () => {
    mockedApi.post.mockResolvedValue({ data: sampleResponse });
    const result = await sendAIChat({
      message: "  Which tables relate to customers?  ",
      data_source_id: "11111111-1111-1111-1111-111111111111",
      conversation_id: "33333333-3333-3333-3333-333333333333",
      conversation_version: 1,
    });
    expect(mockedApi.post).toHaveBeenCalledWith(
      aiPaths.chat,
      {
        message: "Which tables relate to customers?",
        data_source_id: "11111111-1111-1111-1111-111111111111",
        conversation_id: "33333333-3333-3333-3333-333333333333",
        conversation_version: 1,
      },
      { timeout: 180_000, signal: undefined },
    );
    expect(result.response).toContain("Customers");
    expect(result.conversation_id).toBe(
      "33333333-3333-3333-3333-333333333333",
    );
    expect(result.conversation_version).toBe(2);
  });

  it("rejects invalid envelopes", () => {
    expect(() => normalizeAIChatResponse({})).toThrow(ApiError);
  });
});

describe("Conversation API", () => {
  beforeEach(() => {
    mockedApi.get.mockReset();
    mockedApi.post.mockReset();
    mockedApi.patch.mockReset();
  });

  it("lists workspace conversations", async () => {
    mockedApi.get.mockResolvedValue({
      data: {
        items: [sampleConversation],
        page: 1,
        page_size: 50,
        total: 1,
      },
    });
    const result = await listConversations("ws-1", { status: "ACTIVE" });
    expect(mockedApi.get).toHaveBeenCalledWith(
      conversationPaths.root("ws-1"),
      {
        params: { page: 1, page_size: 50, status: "ACTIVE" },
      },
    );
    expect(result.items[0]?.conversation_id).toBe(
      sampleConversation.conversation_id,
    );
  });

  it("creates a conversation", async () => {
    mockedApi.post.mockResolvedValue({ data: sampleConversation });
    const result = await createConversation("ws-1", {
      data_source_id: "11111111-1111-1111-1111-111111111111",
    });
    expect(mockedApi.post).toHaveBeenCalledWith(
      conversationPaths.root("ws-1"),
      { data_source_id: "11111111-1111-1111-1111-111111111111" },
    );
    expect(result.status).toBe("ACTIVE");
  });

  it("loads conversation messages", async () => {
    mockedApi.get.mockResolvedValue({
      data: {
        items: [
          {
            role: "user",
            content: "Hello",
            message_id: "m1",
          },
          {
            role: "assistant",
            content: "Hi",
            message_id: "m2",
          },
        ],
        page: 1,
        page_size: 100,
        total: 2,
      },
    });
    const result = await listConversationMessages("ws-1", "c1");
    expect(mockedApi.get).toHaveBeenCalledWith(
      conversationPaths.messages("ws-1", "c1"),
      { params: { page: 1, page_size: 100 } },
    );
    expect(result.items).toHaveLength(2);
  });

  it("marks a conversation completed", async () => {
    mockedApi.patch.mockResolvedValue({
      data: { ...sampleConversation, status: "COMPLETED" },
    });
    const result = await updateConversation("ws-1", "c1", {
      status: "COMPLETED",
      expected_agent_version: 2,
    });
    expect(mockedApi.patch).toHaveBeenCalledWith(
      conversationPaths.byId("ws-1", "c1"),
      { status: "COMPLETED", expected_agent_version: 2 },
    );
    expect(result.status).toBe("COMPLETED");
  });

  it("appends a user-only message", async () => {
    mockedApi.post.mockResolvedValue({
      data: { ...sampleConversation, conversation_version: 3, message_count: 3 },
    });
    const result = await appendConversationMessage("ws-1", "c1", {
      content: "Follow-up",
      expected_context_version: 2,
    });
    expect(mockedApi.post).toHaveBeenCalledWith(
      conversationPaths.messages("ws-1", "c1"),
      {
        content: "Follow-up",
        expected_context_version: 2,
        trim_if_needed: false,
        role: "user",
      },
    );
    expect(result.conversation_version).toBe(3);
  });

  it("rejects invalid conversation payloads", () => {
    expect(() => normalizeConversation({})).toThrow(ApiError);
  });
});

describe("aiErrorMessage", () => {
  it("maps provider configuration and timeout failures", () => {
    expect(
      aiErrorMessage(new ApiError("AI provider is not configured", 503)),
    ).toBe("The analyst is temporarily unavailable.");
    expect(aiErrorMessage(new ApiError("AI provider timed out", 504))).toBe(
      "The analysis timed out. The server may still be working — wait a moment and try again.",
    );
    expect(
      aiErrorMessage(new ApiError("Too many requests", 429, { retryAfter: 9 })),
    ).toBe("Too many requests. Try again in 9 seconds.");
  });

  it("maps permission and conflict failures", () => {
    expect(aiErrorMessage(new ApiError("Not authorized", 403))).toBe(
      "You don't have permission to use the AI Analyst.",
    );
    expect(aiErrorMessage(new ApiError("Conflict", 409))).toBe(
      "This conversation changed elsewhere. Refresh and try again.",
    );
    expect(
      aiErrorMessage(
        new ApiError("Conversation version conflict", 400, {
          requestId: "req-abc",
        }),
      ),
    ).toBe(
      "This conversation changed elsewhere. Refresh and try again. (Request ID: req-abc)",
    );
  });

  it("does not expose MCP wording from backend details", () => {
    expect(
      conversationErrorMessage(
        new ApiError("Something went wrong. Please try again.", 500),
      ),
    ).toBe("We couldn't load your conversations.");
  });
});
