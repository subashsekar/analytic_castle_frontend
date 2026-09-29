"use client";

import type { Anomaly, AnomalyAnalysisResult } from "@/features/ai/types";
import { ConfidenceIndicator } from "@/features/ai/components/analysis/confidence-indicator";
import {
  anomalyTypeLabel,
  formatNumber,
  formatPercent,
} from "@/features/ai/components/analysis/format";
import {
  AnalysisSection,
  ExpandableDetails,
} from "@/features/ai/components/analysis/analysis-section";

function AnomalyCard({ anomaly }: { anomaly: Anomaly }) {
  const expectedRange =
    anomaly.expected_low !== null || anomaly.expected_high !== null
      ? `${formatNumber(anomaly.expected_low)}–${formatNumber(anomaly.expected_high)}`
      : null;

  return (
    <article className="rounded-md border border-border bg-surface p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h4 className="text-[14px] font-bold text-text-1">
          {anomalyTypeLabel(anomaly.anomaly_type)}
        </h4>
        <span className="rounded-full bg-warning-tint px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-warning">
          {anomaly.severity}
        </span>
      </div>
      <p className="text-[12.8px] leading-relaxed text-text-2">{anomaly.evidence}</p>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-[12px] sm:grid-cols-4">
        <div>
          <dt className="text-text-3">Metric</dt>
          <dd className="font-medium text-text-1">{anomaly.column}</dd>
        </div>
        <div>
          <dt className="text-text-3">Observed</dt>
          <dd className="font-mono-tabular font-medium text-text-1">
            {formatNumber(anomaly.value)}
          </dd>
        </div>
        {expectedRange ? (
          <div>
            <dt className="text-text-3">Expected range</dt>
            <dd className="font-mono-tabular text-text-1">{expectedRange}</dd>
          </div>
        ) : null}
        {anomaly.period ? (
          <div>
            <dt className="text-text-3">Period</dt>
            <dd className="text-text-1">{anomaly.period}</dd>
          </div>
        ) : null}
        {anomaly.previous_value !== null ? (
          <div>
            <dt className="text-text-3">Previous</dt>
            <dd className="font-mono-tabular text-text-1">
              {formatNumber(anomaly.previous_value)}
            </dd>
          </div>
        ) : null}
        {anomaly.percent_change !== null ? (
          <div>
            <dt className="text-text-3">Deviation</dt>
            <dd className="font-mono-tabular text-text-1">
              {formatPercent(anomaly.percent_change)}
            </dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}

export function AnomaliesSection({ anomalies }: { anomalies: AnomalyAnalysisResult }) {
  const noneDetected =
    anomalies.anomaly_count === 0 &&
    /no anomal/i.test(anomalies.summary);

  return (
    <AnalysisSection
      id="phase8-anomalies"
      title="Anomaly Detection"
      description="ANOMALY_DETECTION — outliers, unexpected changes, and threshold breaches."
    >
      {noneDetected ? (
        <p className="text-[13px] text-text-2">No significant anomalies detected.</p>
      ) : (
        <>
          <p className="text-[13px] leading-relaxed text-text-2">{anomalies.summary}</p>
          <div className="space-y-3">
            {anomalies.scan.anomalies.map((item, index) => (
              <AnomalyCard
                key={`${item.column}-${item.anomaly_type}-${item.row_index ?? index}`}
                anomaly={item}
              />
            ))}
          </div>
        </>
      )}

      <ExpandableDetails summary="Detection narrative">
        <p>
          <span className="font-semibold text-text-1">Outliers: </span>
          {anomalies.outliers}
        </p>
        <p className="mt-2">
          <span className="font-semibold text-text-1">Unexpected changes: </span>
          {anomalies.unexpected_changes}
        </p>
        <p className="mt-2">
          <span className="font-semibold text-text-1">Threshold breaches: </span>
          {anomalies.threshold_breaches}
        </p>
        {anomalies.conclusions.length > 0 ? (
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {anomalies.conclusions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </ExpandableDetails>

      <ConfidenceIndicator
        value={anomalies.confidence_score}
        reasoning={anomalies.confidence_reasoning}
      />
    </AnalysisSection>
  );
}
