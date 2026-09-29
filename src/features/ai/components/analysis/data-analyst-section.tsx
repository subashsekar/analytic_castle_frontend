"use client";

import type { DataAnalysisResult } from "@/features/ai/types";
import { ConfidenceIndicator } from "@/features/ai/components/analysis/confidence-indicator";
import {
  AnalysisSection,
  ExpandableDetails,
} from "@/features/ai/components/analysis/analysis-section";

export function DataAnalystSection({
  analyst,
}: {
  analyst: DataAnalysisResult;
}) {
  return (
    <AnalysisSection
      id="phase8-data-analyst"
      title="Data Analyst"
      description="DATA_ANALYST — interpretation of the query results."
    >
      <p className="text-[13.5px] leading-relaxed text-text-1">
        {analyst.interpretation}
      </p>
      <ExpandableDetails summary="Summary & comparisons">
        <p className="whitespace-pre-wrap">{analyst.summary}</p>
        <p className="mt-2 whitespace-pre-wrap">{analyst.comparisons}</p>
      </ExpandableDetails>
      {analyst.conclusions.length > 0 ? (
        <ExpandableDetails summary="Conclusions">
          <ul className="list-disc space-y-1 pl-5">
            {analyst.conclusions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </ExpandableDetails>
      ) : null}
      <ConfidenceIndicator
        value={analyst.confidence_score}
        reasoning={analyst.confidence_reasoning}
      />
    </AnalysisSection>
  );
}
