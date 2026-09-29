"use client";

import type { BusinessInsight, InsightAnalysisResult } from "@/features/ai/types";
import { ConfidenceIndicator } from "@/features/ai/components/analysis/confidence-indicator";
import {
  AnalysisSection,
  ExpandableDetails,
} from "@/features/ai/components/analysis/analysis-section";

function InsightCard({ insight }: { insight: BusinessInsight }) {
  return (
    <article className="rounded-md border border-border bg-[linear-gradient(135deg,var(--signal-tint),transparent_70%)] p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h4 className="text-[14px] font-bold text-text-1">{insight.title}</h4>
        <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-2">
          {insight.priority}
        </span>
      </div>
      <p className="text-[12.8px] leading-relaxed text-text-2">{insight.insight}</p>
      {insight.metric ? (
        <p className="mt-2 text-[12px] text-text-3">
          Metric: <span className="font-mono text-text-1">{insight.metric}</span>
        </p>
      ) : null}
      <p className="mt-2 text-[12.5px] leading-relaxed text-text-2">
        <span className="font-semibold text-text-1">Impact: </span>
        {insight.business_impact}
      </p>
      <div className="mt-3">
        <ExpandableDetails summary="Supporting evidence">
          <p className="whitespace-pre-wrap">{insight.supporting_evidence}</p>
          <ConfidenceIndicator
            value={insight.confidence_score}
            reasoning={insight.confidence_reasoning}
          />
        </ExpandableDetails>
      </div>
    </article>
  );
}

export function InsightsSection({ insights }: { insights: InsightAnalysisResult }) {
  if (insights.insights.length === 0 && !insights.summary) {
    return null;
  }

  return (
    <AnalysisSection
      id="phase8-insights"
      title="Insights"
      description={
        insights.top_insight
          ? `INSIGHT — ${insights.top_insight}`
          : "INSIGHT — prioritized business findings from the analysis pipeline."
      }
    >
      {insights.summary ? (
        <p className="text-[13px] leading-relaxed text-text-2">{insights.summary}</p>
      ) : null}
      <div className="space-y-3">
        {insights.insights.map((item) => (
          <InsightCard key={`${item.rank}-${item.title}`} insight={item} />
        ))}
      </div>
      {insights.data_gaps.length > 0 ? (
        <ExpandableDetails summary="Data gaps">
          <ul className="list-disc space-y-1 pl-5">
            {insights.data_gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </ExpandableDetails>
      ) : null}
      <ConfidenceIndicator
        value={insights.confidence_score}
        reasoning={insights.confidence_reasoning}
      />
    </AnalysisSection>
  );
}
