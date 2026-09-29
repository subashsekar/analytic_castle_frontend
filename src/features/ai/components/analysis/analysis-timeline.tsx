"use client";

import { Check } from "lucide-react";
import type { Phase8Analysis } from "@/features/ai/types";
import { AnalysisSection } from "@/features/ai/components/analysis/analysis-section";

type TimelineStage = {
  id: string;
  label: string;
  done: boolean;
};

/** Product-level stages only for agents that returned a section. */
export function buildAnalysisTimeline(analysis: Phase8Analysis): TimelineStage[] {
  const stages: TimelineStage[] = [
    { id: "understood", label: "Question understood", done: true },
  ];

  if (analysis.data_analyst) {
    stages.push({ id: "analyst", label: "Results analyzed", done: true });
  }
  if (analysis.trend) {
    stages.push({ id: "trends", label: "Trends identified", done: true });
  }
  if (analysis.anomaly) {
    stages.push({
      id: "anomalies",
      label:
        analysis.anomaly.anomaly_count === 0
          ? "Anomalies reviewed"
          : "Anomalies detected",
      done: true,
    });
  }
  if (analysis.root_cause) {
    stages.push({
      id: "root-cause",
      label: "Root causes examined",
      done: true,
    });
  }
  if (analysis.insight) {
    stages.push({ id: "insights", label: "Insights generated", done: true });
  }
  if (analysis.recommendation) {
    stages.push({
      id: "recommendations",
      label: "Recommendations prepared",
      done: true,
    });
  }
  if (stages.length > 1) {
    stages.push({ id: "complete", label: "Analysis complete", done: true });
  }

  return stages;
}

export function AnalysisTimeline({ analysis }: { analysis: Phase8Analysis }) {
  const stages = buildAnalysisTimeline(analysis);
  if (stages.length <= 1) {
    return null;
  }

  return (
    <AnalysisSection id="phase8-timeline" title="Analysis Timeline">
      <ol className="space-y-2">
        {stages.map((stage) => (
          <li key={stage.id} className="flex items-start gap-2.5 text-[13px]">
            <span
              className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
                stage.done
                  ? "bg-success-tint text-success"
                  : "bg-sunken text-text-3"
              }`}
              aria-hidden
            >
              {stage.done ? <Check className="size-3.5" strokeWidth={2.4} /> : null}
            </span>
            <span className={stage.done ? "text-text-1" : "text-text-3"}>
              {stage.label}
              <span className="sr-only">
                {stage.done ? " — completed" : " — in progress"}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </AnalysisSection>
  );
}
