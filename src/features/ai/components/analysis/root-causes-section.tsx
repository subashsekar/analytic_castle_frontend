"use client";

import type {
  RootCauseAnalysisResult,
  RootCauseHypothesis,
} from "@/features/ai/types";
import { ConfidenceIndicator } from "@/features/ai/components/analysis/confidence-indicator";
import {
  AnalysisSection,
  ExpandableDetails,
} from "@/features/ai/components/analysis/analysis-section";

function HypothesisCard({ hypothesis }: { hypothesis: RootCauseHypothesis }) {
  return (
    <article className="rounded-md border border-border bg-surface p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-border bg-sunken px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-2">
          Candidate cause
        </span>
        <span className="text-[11px] text-text-3">Rank {hypothesis.rank}</span>
      </div>
      <p className="text-[13.5px] font-medium leading-relaxed text-text-1">
        {hypothesis.statement}
      </p>
      <p className="mt-1 text-[11.5px] text-text-3">
        Presented as a hypothesis from the analysis — not an established fact.
      </p>

      {hypothesis.contributing_factors.length > 0 ? (
        <div className="mt-3">
          <p className="text-[11.5px] font-semibold uppercase tracking-wide text-text-3">
            Suspected contributing factors
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-[12.5px] text-text-2">
            {hypothesis.contributing_factors.map((factor) => (
              <li key={factor}>{factor}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <ExpandableDetails summary="Evidence & confidence">
        <p>
          <span className="font-semibold text-text-1">Supporting evidence: </span>
          {hypothesis.supporting_evidence}
        </p>
        {hypothesis.contradicting_evidence ? (
          <p className="mt-2">
            <span className="font-semibold text-text-1">Contradicting evidence: </span>
            {hypothesis.contradicting_evidence}
          </p>
        ) : null}
        {hypothesis.investigation_question ? (
          <p className="mt-2">
            <span className="font-semibold text-text-1">Further investigation: </span>
            {hypothesis.investigation_question}
          </p>
        ) : null}
        <div className="mt-2">
          <ConfidenceIndicator
            value={hypothesis.confidence_score}
            reasoning={hypothesis.confidence_reasoning}
          />
        </div>
      </ExpandableDetails>
    </article>
  );
}

export function RootCausesSection({
  rootCause,
}: {
  rootCause: RootCauseAnalysisResult;
}) {
  if (
    rootCause.hypotheses.length === 0 &&
    !rootCause.summary &&
    !rootCause.primary_cause
  ) {
    return null;
  }

  return (
    <AnalysisSection
      id="phase8-root-causes"
      title="Root Cause Analysis"
      description="ROOT_CAUSE_ANALYSIS — candidate explanations. Treat uncertain language as provisional."
    >
      {rootCause.summary ? (
        <p className="text-[13px] leading-relaxed text-text-2">{rootCause.summary}</p>
      ) : null}
      {rootCause.primary_cause ? (
        <p className="rounded-sm border border-border bg-sunken/50 px-3 py-2 text-[13px] text-text-1">
          <span className="font-semibold">Leading candidate: </span>
          {rootCause.primary_cause}
        </p>
      ) : null}
      <div className="space-y-3">
        {rootCause.hypotheses.map((item) => (
          <HypothesisCard key={`${item.rank}-${item.statement}`} hypothesis={item} />
        ))}
      </div>
      <ConfidenceIndicator
        value={rootCause.confidence_score}
        reasoning={rootCause.confidence_reasoning}
      />
    </AnalysisSection>
  );
}
