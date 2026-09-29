"use client";

import type { EvaluationReport } from "@/features/ai/types";
import {
  AnalysisSection,
  ExpandableDetails,
} from "@/features/ai/components/analysis/analysis-section";

const STATUS_CLASS: Record<string, string> = {
  PASS: "bg-success-tint text-success",
  FAIL: "bg-error-tint text-error",
  WARN: "bg-warning-tint text-warning",
  SKIPPED: "bg-sunken text-text-3",
};

export function EvaluationSection({
  evaluation,
}: {
  evaluation: EvaluationReport;
}) {
  return (
    <AnalysisSection
      id="phase8-evaluation"
      title="Quality checks"
      description="Evaluation report — VERIFIED failures are hard findings; ESTIMATED results are warnings only."
    >
      <ExpandableDetails summary="Show evaluation details" defaultOpen={false}>
        <dl className="grid grid-cols-2 gap-3 text-[12px] sm:grid-cols-4">
          <div>
            <dt className="text-text-3">Verified correct</dt>
            <dd className="font-semibold text-text-1">
              {evaluation.verified_correct ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-text-3">Verified pass rate</dt>
            <dd className="font-mono-tabular text-text-1">
              {(evaluation.metrics.verified_pass_rate * 100).toFixed(0)}%
            </dd>
          </div>
          <div>
            <dt className="text-text-3">Verified failures</dt>
            <dd className="font-mono-tabular text-text-1">
              {evaluation.metrics.verified_failures}
            </dd>
          </div>
          <div>
            <dt className="text-text-3">Estimated warnings</dt>
            <dd className="font-mono-tabular text-text-1">
              {evaluation.metrics.estimated_warnings}
            </dd>
          </div>
        </dl>

        <div className="mt-4 space-y-3">
          {evaluation.agents.map((agent) => (
            <div
              key={agent.agent}
              className="rounded-sm border border-border bg-sunken/40 px-3 py-2"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[12.5px] font-semibold text-text-1">
                  {agent.agent}
                </p>
                <span className="text-[11px] text-text-3">
                  verified_correct={String(agent.verified_correct)}
                </span>
              </div>
              <ul className="mt-2 space-y-1.5">
                {agent.checks.map((check) => (
                  <li
                    key={`${check.check_id}-${check.status}`}
                    className="flex flex-wrap items-start gap-2 text-[12px]"
                  >
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_CLASS[check.status] ?? STATUS_CLASS.SKIPPED}`}
                    >
                      {check.status}
                    </span>
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold text-text-2">
                      {check.method}
                    </span>
                    <span className="min-w-0 flex-1 text-text-2">
                      <span className="font-medium text-text-1">
                        {check.check_id}
                      </span>
                      {" — "}
                      {check.detail}
                      {check.method === "ESTIMATED" && check.status === "WARN" ? (
                        <span className="text-text-3">
                          {" "}
                          (estimate — not treated as incorrectness)
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {evaluation.agents_not_evaluated.length > 0 ? (
          <p className="mt-3 text-[12px] text-text-3">
            Not evaluated: {evaluation.agents_not_evaluated.join(", ")}
          </p>
        ) : null}

        {evaluation.notes.length > 0 ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-text-2">
            {evaluation.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : null}
      </ExpandableDetails>
    </AnalysisSection>
  );
}
