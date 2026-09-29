import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderWithQuery } from "@/test/render";
import {
  derivePrimaryAnswer,
  stripComposedMetadata,
} from "@/features/ai/answer-body";
import { AnalystContent } from "@/features/ai/components/analyst-content";
import { AnalystMessage } from "@/features/ai/components/message-bubbles";
import { FollowUpSuggestions } from "@/features/ai/components/follow-up-suggestions";

describe("answer body helpers", () => {
  it("strips composed metadata and keeps the answer prose", () => {
    const raw = [
      "Question understood: Compare revenue Feb vs Mar",
      "Date range: Feb–Mar 2025",
      "SQL: WITH x AS (",
      "  SELECT 1",
      ")",
      "SELECT * FROM x",
      "Assumptions:",
      "- Calendar months",
      "Chart hint: bar",
      "Notes: refunds excluded",
      "",
      "Measured findings",
      "- February: $1.2M",
      "- March: $1.5M",
    ].join("\n");

    const stripped = stripComposedMetadata(raw);
    expect(stripped).toContain("Measured findings");
    expect(stripped).toContain("February: $1.2M");
    expect(stripped).not.toMatch(/Question understood/i);
    expect(stripped).not.toMatch(/^SQL:/m);
    expect(stripped).not.toContain("WITH x AS");
    expect(stripped).not.toMatch(/Assumptions/i);
  });

  it("prefers analysis.facts for the primary answer", () => {
    const result = derivePrimaryAnswer(
      {
        facts: ["March was higher", "Feb $1.2M", "Mar $1.5M"],
        sql: "SELECT 1",
      },
      "Question understood: x\nSQL: SELECT 1\nWall of text",
    );
    expect(result.facts).toEqual([
      "March was higher",
      "Feb $1.2M",
      "Mar $1.5M",
    ]);
    expect(result.text).toBe("");
  });
});

describe("AnalystContent", () => {
  it("renders paragraphs, lists, and code", () => {
    renderWithQuery(
      <AnalystContent
        text={`## Findings\n- One\n- Two\n\nUse \`orders.id\`.\n\n\`\`\`sql\nselect 1\n\`\`\``}
      />,
    );
    expect(screen.getByText("Findings")).toBeTruthy();
    expect(screen.getByText("One")).toBeTruthy();
    expect(screen.getByText("orders.id")).toBeTruthy();
    expect(screen.getByText(/select 1/i)).toBeTruthy();
  });

  it("strips metadata when analysis is absent", () => {
    const composed = [
      "Question understood: What drove the change?",
      "SQL: SELECT region, revenue FROM sales",
      "Assumptions: regions are complete",
      "",
      "West region drove most of the increase.",
    ].join("\n");

    renderWithQuery(<AnalystMessage content={composed} />);
    expect(
      screen.getByText("West region drove most of the increase."),
    ).toBeTruthy();
    expect(screen.queryByText(/Question understood/i)).toBeNull();
    expect(screen.queryByText(/SELECT region/i)).toBeNull();
  });
});

describe("AnalystMessage", () => {
  it("renders retry on error and hides MCP terms", () => {
    renderWithQuery(
      <AnalystMessage
        content=""
        error="The analysis was interrupted. Try again."
        onRetry={() => undefined}
      />,
    );
    expect(
      screen.getByText(/analysis was interrupted/i),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: /try again/i })).toBeTruthy();
    expect(screen.queryByText(/MCP|list_tables/i)).toBeNull();
  });

  it("does not duplicate clarification when it matches content", () => {
    renderWithQuery(
      <AnalystMessage
        content="What kind of report would you like?"
        response={
          {
            response: "What kind of report would you like?",
            model: "test",
            request_id: "req-1",
            usage: {
              input_tokens: 1,
              output_tokens: 1,
              total_tokens: 2,
            },
            analysis: null,
            intent: {
              intent: "UNKNOWN",
              operation: null,
              subject: null,
              metrics: [],
              dimensions: [],
              filters: [],
              time_range: null,
              sort: null,
              requested_limit: null,
              safe_limit: null,
              exceeds_limit: false,
              requires_data_access: false,
              requires_metadata: false,
              requires_relationships: false,
              confidence: "LOW",
              requires_clarification: true,
              clarification_question: "What kind of report would you like?",
              unsupported_reason: null,
            },
            plan: {
              intent: "UNKNOWN",
              operations: [],
              metrics: [],
              dimensions: [],
              filters: [],
              time_range: null,
              sort: null,
              limit: null,
              requires_clarification: true,
              clarification_question: "What kind of report would you like?",
              unsupported: false,
              unsupported_reason: null,
              capabilities_needed: [],
              assumptions: [],
              steps: [],
            },
            metadata_context: {
              data_source_id: "ds-1",
              matched_tables: [],
              matched_columns: [],
              matched_relationships: [],
              unresolved_concepts: [],
              requires_clarification: false,
              clarification_question: null,
            },
          } as never
        }
      />,
    );
    expect(screen.getAllByText(/What kind of report would you like/i)).toHaveLength(
      1,
    );
    expect(screen.queryByText(/Needs clarification/i)).toBeNull();
  });
});

describe("FollowUpSuggestions", () => {
  it("renders nothing when empty", () => {
    const { container } = render(
      <FollowUpSuggestions suggestions={[]} onSelect={() => undefined} />,
    );
    expect(container.innerHTML).toBe("");
  });
});
