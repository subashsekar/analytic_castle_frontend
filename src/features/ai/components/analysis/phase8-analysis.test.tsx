import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderWithQuery } from "@/test/render";
import {
  hasPhase8Analysis,
  normalizeAIChatResponse,
  normalizePhase8Analysis,
} from "@/features/ai/api";
import { AnalysisReport } from "@/features/ai/components/analysis/analysis-report";
import {
  phase8AnalysisFixture,
  phase8PartialFixture,
} from "@/features/ai/components/analysis/phase8-fixtures";
import { AnalystMessage } from "@/features/ai/components/message-bubbles";
import type { AIChatResponse } from "@/features/ai/types";

const baseChatFields = {
  request_id: "req-phase8",
  response: "March revenue reversal is the primary business finding.",
  model: "gpt-4o-mini",
  usage: { input_tokens: 10, output_tokens: 20, total_tokens: 30 },
  intent: {
    type: "ANALYTICAL_QUERY",
    operation: null,
    subject: "revenue",
    metrics: [],
    dimensions: [],
    filters: [],
    time_range: null,
    sort: null,
    requested_limit: null,
    safe_limit: null,
    exceeds_limit: false,
    requires_data_access: true,
    requires_metadata: true,
    confidence: "HIGH",
    requires_clarification: false,
    clarification_question: null,
  },
  plan: {
    requires_clarification: false,
    clarification_question: null,
    operations: ["ANALYZE"],
    required_capabilities: ["DATABASE"],
    requires_metadata: true,
    requires_database: true,
    requires_sample_data: false,
    requires_aggregation: true,
    requires_time_filter: true,
    requires_relationships: false,
    unsupported: false,
  },
  metadata_context: {
    data_source_id: "11111111-1111-1111-1111-111111111111",
    tables: [
      {
        table_id: "t1",
        schema_name: "public",
        table_name: "sales",
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
  conversation_id: "33333333-3333-3333-3333-333333333333",
  conversation_version: 3,
};

describe("Phase 8 analysis API normalization", () => {
  it("normalizes nested analysis namespace on the chat response", () => {
    const normalized = normalizeAIChatResponse({
      ...baseChatFields,
      analysis: phase8AnalysisFixture,
    });

    expect(normalized.analysis?.insight?.insights[0]?.title).toBe(
      "Revenue reversed in March",
    );
    expect(normalized.analysis?.trend?.direction).toBe("DECREASING");
    expect(normalized.analysis?.anomaly?.anomaly_count).toBe(1);
    expect(normalized.analysis?.recommendation?.recommendations).toHaveLength(1);
    expect(normalized.analysis?.evaluation?.verified_correct).toBe(true);
    expect(hasPhase8Analysis(normalized.analysis)).toBe(true);
  });

  it("accepts singular agent field names (anomaly, insight, recommendation)", () => {
    const report = normalizePhase8Analysis({
      analysis: {
        data_analyst: phase8AnalysisFixture.data_analyst,
        anomaly: phase8AnalysisFixture.anomaly,
        insight: phase8AnalysisFixture.insight,
        recommendation: phase8AnalysisFixture.recommendation,
      },
    });
    expect(report?.anomaly?.anomaly_count).toBe(1);
    expect(report?.insight?.top_insight).toContain("Revenue");
    expect(report?.recommendation?.top_recommendation).toContain("campaign");
  });

  it("normalizes analysis.sql and query_preview when present", () => {
    const report = normalizePhase8Analysis({
      analysis: {
        sql: "SELECT month, revenue FROM sales",
        query_preview: {
          columns: ["month", "revenue"],
          row_count: 3,
          truncated: false,
          sample_rows: [
            ["2024-01", 100],
            ["2024-02", 105],
          ],
        },
      },
    });
    expect(report?.sql).toContain("SELECT");
    expect(report?.query_preview?.columns).toEqual(["month", "revenue"]);
    expect(report?.query_preview?.sample_rows).toHaveLength(2);
    expect(hasPhase8Analysis(report)).toBe(true);
  });

  it("normalizes facts, question_understood, and assumptions", () => {
    const report = normalizePhase8Analysis({
      analysis: {
        question_understood: "Compare Feb vs Mar revenue",
        date_range: "2025-02 to 2025-03",
        facts: [
          "March revenue was higher than February.",
          "February: $1.2M",
          "March: $1.5M",
        ],
        assumptions: ["Calendar month boundaries"],
        notes: ["Excludes refunds"],
        chart_hint: "bar",
        sql: "SELECT 1",
      },
    });
    expect(report?.facts).toHaveLength(3);
    expect(report?.question_understood).toContain("Compare");
    expect(report?.assumptions).toEqual(["Calendar month boundaries"]);
    expect(hasPhase8Analysis(report)).toBe(true);
  });

  it("returns null when no analysis sections are present", () => {
    expect(normalizePhase8Analysis({ request_id: "x" })).toBeNull();
    expect(hasPhase8Analysis(null)).toBe(false);
  });
});

describe("Phase 8 analysis report UI", () => {
  it("renders all six agent sections plus evaluation in pipeline order", () => {
    renderWithQuery(
      <AnalysisReport
        analysis={phase8AnalysisFixture}
        narrative="March revenue reversal is the primary business finding."
        metadata={baseChatFields.metadata_context}
      />,
    );

    expect(screen.getByRole("article", { name: /analysis report/i })).toBeTruthy();
    expect(screen.getByText("Data Analyst")).toBeTruthy();
    expect(screen.getByText("Trend Analysis")).toBeTruthy();
    expect(screen.getByText("DECREASING")).toBeTruthy();
    expect(screen.getByText("Anomaly Detection")).toBeTruthy();
    expect(screen.getByText("Root Cause Analysis")).toBeTruthy();
    expect(screen.getByText("Insights")).toBeTruthy();
    expect(screen.getByText("Recommendations")).toBeTruthy();
    expect(screen.getByText("Quality checks")).toBeTruthy();
    expect(screen.getAllByText("Revenue reversed in March").length).toBeGreaterThan(0);
    expect(screen.queryByText(/planner|tool_call|chain_of_thought|MCP/i)).toBeNull();
  });

  it("renders a partial payload (analyst + insight) without errors", () => {
    render(<AnalysisReport analysis={phase8PartialFixture} />);
    expect(screen.getByText("Data Analyst")).toBeTruthy();
    expect(screen.getByText("Insights")).toBeTruthy();
    expect(screen.queryByText("Trend Analysis")).toBeNull();
    expect(screen.queryByText("Recommendations")).toBeNull();
  });

  it("shows empty anomaly wording when backend reports none", () => {
    render(
      <AnalysisReport
        analysis={{
          anomaly: {
            ...phase8AnalysisFixture.anomaly!,
            anomaly_count: 0,
            highest_severity: null,
            scan: { ...phase8AnalysisFixture.anomaly!.scan, anomalies: [] },
            summary: "No anomalies were detected across 3 row(s) in revenue.",
          },
        }}
      />,
    );
    expect(screen.getByText("No significant anomalies detected.")).toBeTruthy();
  });

  it("integrates the report into AnalystMessage when analysis is present", () => {
    const response = {
      ...baseChatFields,
      analysis: phase8AnalysisFixture,
    } as AIChatResponse;

    renderWithQuery(
      <AnalystMessage
        content={baseChatFields.response}
        response={response}
        dataSourceId="11111111-1111-1111-1111-111111111111"
      />,
    );

    expect(screen.getByRole("article", { name: /analysis report/i })).toBeTruthy();
    expect(screen.getByText("Data Analyst")).toBeTruthy();
  });

  it("shows facts first and keeps SQL collapsed", () => {
    const composed = [
      "Question understood: Compare revenue in February 2025 vs March 2025",
      "Date range: 2025-02-01 to 2025-03-31",
      "SQL: WITH months AS (SELECT 1) SELECT * FROM months",
      "Assumptions: Calendar months",
      "",
      "This wall of text should not appear when facts exist.",
    ].join("\n");

    const response = {
      ...baseChatFields,
      response: composed,
      analysis: {
        question_understood: "Compare revenue in February 2025 vs March 2025",
        date_range: "2025-02-01 to 2025-03-31",
        facts: [
          "March revenue exceeded February.",
          "February 2025: $1,200,000",
          "March 2025: $1,500,000",
        ],
        assumptions: ["Calendar months"],
        sql: "WITH months AS (SELECT 1) SELECT * FROM months",
      },
    } as AIChatResponse;

    renderWithQuery(
      <AnalystMessage content={composed} response={response} />,
    );

    expect(screen.getByText("March revenue exceeded February.")).toBeTruthy();
    expect(screen.getByText("February 2025: $1,200,000")).toBeTruthy();
    expect(screen.queryByText(/This wall of text should not appear/i)).toBeNull();
    const sqlSummary = screen.getByText("SQL");
    expect(sqlSummary).toBeTruthy();
    expect(sqlSummary.closest("details")?.hasAttribute("open")).toBe(false);
    expect(screen.getByText("How I understood this")).toBeTruthy();
    expect(screen.getByText("Assumptions")).toBeTruthy();
  });

  it("blocks analysis UI when clarification is required", () => {
    const response = {
      ...baseChatFields,
      intent: {
        ...baseChatFields.intent,
        requires_clarification: true,
        clarification_question: "Which time range should we use?",
      },
      plan: {
        ...baseChatFields.plan,
        requires_clarification: true,
        clarification_question: "Which time range should we use?",
      },
      analysis: phase8AnalysisFixture,
    } as AIChatResponse;

    renderWithQuery(
      <AnalystMessage
        content="I need a bit more detail."
        response={response}
      />,
    );

    expect(screen.queryByRole("article", { name: /analysis report/i })).toBeNull();
    expect(
      screen.getByText(/more detail is needed before analysis can finish/i),
    ).toBeTruthy();
  });

  it("keeps ordinary chat when analysis is absent", () => {
    const response = {
      ...baseChatFields,
      analysis: null,
    } as AIChatResponse;

    renderWithQuery(
      <AnalystMessage content={baseChatFields.response} response={response} />,
    );

    expect(screen.queryByRole("article", { name: /analysis report/i })).toBeNull();
    expect(
      screen.getByText("March revenue reversal is the primary business finding."),
    ).toBeTruthy();
  });
});
