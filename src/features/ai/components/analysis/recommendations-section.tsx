"use client";

import type {
  RecommendationItem,
  RecommendationResult,
} from "@/features/ai/types";
import { ConfidenceIndicator } from "@/features/ai/components/analysis/confidence-indicator";
import {
  AnalysisSection,
  ExpandableDetails,
} from "@/features/ai/components/analysis/analysis-section";

function RecommendationCard({ item }: { item: RecommendationItem }) {
  return (
    <article className="border-l-[3px] border-signal bg-surface py-1 pl-4">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h4 className="text-[14px] font-bold text-text-1">{item.title}</h4>
        <span className="rounded-full border border-border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-2">
          {item.priority}
        </span>
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-signal">
        Recommendation
      </p>
      <p className="mt-1 text-[13.5px] leading-relaxed text-text-1">
        {item.recommendation}
      </p>
      <p className="mt-2 text-[12.5px] leading-relaxed text-text-2">
        <span className="font-semibold text-text-1">Expected outcome: </span>
        {item.expected_outcome}
      </p>
      <p className="mt-1 text-[12px] text-text-3">
        Evidence reference:{" "}
        <span className="font-mono text-text-2">{item.evidence_reference}</span>
      </p>
      <p className="mt-1 text-[11.5px] text-text-3">
        impact={item.impact} · feasibility={item.feasibility}
      </p>

      <div className="mt-3">
        <ExpandableDetails summary="Rationale, assumptions & risks">
          <p>
            <span className="font-semibold text-text-1">Supporting evidence: </span>
            {item.supporting_evidence}
          </p>
          {item.assumptions.length > 0 ? (
            <div className="mt-2">
              <p className="font-semibold text-text-1">Assumptions</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {item.assumptions.map((assumption) => (
                  <li key={assumption}>{assumption}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {item.risks.length > 0 ? (
            <div className="mt-2">
              <p className="font-semibold text-text-1">Risks</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {item.risks.map((risk) => (
                  <li key={risk}>{risk}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-2">
            <ConfidenceIndicator
              value={item.confidence_score}
              reasoning={item.confidence_reasoning}
            />
          </div>
        </ExpandableDetails>
      </div>
    </article>
  );
}

export function RecommendationsSection({
  recommendations,
}: {
  recommendations: RecommendationResult;
}) {
  if (
    recommendations.recommendations.length === 0 &&
    !recommendations.summary
  ) {
    return null;
  }

  return (
    <AnalysisSection
      id="phase8-recommendations"
      title="Recommendations"
      description="RECOMMENDATION — suggested actions, distinct from factual findings."
    >
      {recommendations.summary ? (
        <p className="text-[13px] leading-relaxed text-text-2">
          {recommendations.summary}
        </p>
      ) : null}
      {recommendations.top_recommendation ? (
        <p className="rounded-sm border border-border bg-signal-tint/40 px-3 py-2 text-[13px] text-text-1">
          <span className="font-semibold">Top recommendation: </span>
          {recommendations.top_recommendation}
        </p>
      ) : null}
      <div className="space-y-4">
        {recommendations.recommendations.map((item) => (
          <RecommendationCard key={`${item.rank}-${item.title}`} item={item} />
        ))}
      </div>
      {recommendations.data_gaps.length > 0 ? (
        <ExpandableDetails summary="What would need more data">
          <ul className="list-disc space-y-1 pl-5">
            {recommendations.data_gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </ExpandableDetails>
      ) : null}
      <ConfidenceIndicator
        value={recommendations.confidence_score}
        reasoning={recommendations.confidence_reasoning}
      />
    </AnalysisSection>
  );
}
