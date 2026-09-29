"use client";

import type { Anomaly, TrendAnalysisResult } from "@/features/ai/types";
import { ConfidenceIndicator } from "@/features/ai/components/analysis/confidence-indicator";
import {
  formatNumber,
  formatPercent,
  trendDirectionLabel,
} from "@/features/ai/components/analysis/format";
import {
  AnalysisSection,
  ExpandableDetails,
} from "@/features/ai/components/analysis/analysis-section";
import { TrendSeriesChart } from "@/features/ai/components/analysis/trend-chart";

export function TrendsSection({
  trend,
  anomalies = [],
}: {
  trend: TrendAnalysisResult;
  anomalies?: Anomaly[];
}) {
  const direction = trendDirectionLabel(trend.direction);
  const growth = formatPercent(trend.growth_rate_percent);
  const insufficient = trend.direction === "INSUFFICIENT_DATA";

  return (
    <AnalysisSection
      id="phase8-trend"
      title="Trend Analysis"
      description="TREND_ANALYSIS — direction and period evidence from the result series."
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="rounded-full border border-border bg-sunken px-2.5 py-1 text-[12px] font-semibold text-text-1"
          aria-label={`Trend direction: ${trend.direction}`}
        >
          {trend.direction}
        </span>
        <span className="text-[12px] text-text-3">{direction}</span>
        {growth ? (
          <span className="font-mono-tabular text-[13px] text-text-2">
            Growth rate {growth}
          </span>
        ) : null}
        {trend.series.value_column ? (
          <span className="text-[12px] text-text-3">
            Metric: {trend.series.value_column}
          </span>
        ) : null}
      </div>

      <TrendSeriesChart trend={trend} anomalies={anomalies} />

      {insufficient ? (
        <p className="text-[13px] text-text-2" role="status">
          Insufficient data for a reliable trend.
        </p>
      ) : (
        <>
          <p className="text-[13px] leading-relaxed text-text-2">{trend.summary}</p>
          <p className="text-[12.5px] leading-relaxed text-text-2">
            {trend.direction_explanation}
          </p>
        </>
      )}

      {!insufficient && (trend.series.first_period || trend.series.last_period) ? (
        <dl className="grid grid-cols-2 gap-3 rounded-sm border border-border bg-sunken/50 p-3 text-[12px] sm:grid-cols-4">
          <div>
            <dt className="text-text-3">First period</dt>
            <dd className="font-medium text-text-1">
              {trend.series.first_period ?? "—"}
            </dd>
            <dd className="font-mono-tabular text-text-2">
              {formatNumber(trend.series.first_value)}
            </dd>
          </div>
          <div>
            <dt className="text-text-3">Last period</dt>
            <dd className="font-medium text-text-1">
              {trend.series.last_period ?? "—"}
            </dd>
            <dd className="font-mono-tabular text-text-2">
              {formatNumber(trend.series.last_value)}
            </dd>
          </div>
          <div>
            <dt className="text-text-3">Minimum</dt>
            <dd className="font-mono-tabular font-medium text-text-1">
              {formatNumber(trend.series.minimum_value)}
            </dd>
          </div>
          <div>
            <dt className="text-text-3">Maximum</dt>
            <dd className="font-mono-tabular font-medium text-text-1">
              {formatNumber(trend.series.maximum_value)}
            </dd>
          </div>
        </dl>
      ) : null}

      {trend.series.notes.length > 0 ? (
        <p className="text-[12px] text-text-3">{trend.series.notes.join(" ")}</p>
      ) : null}

      <ExpandableDetails summary="Period narrative & conclusions">
        <p className="whitespace-pre-wrap">{trend.period_comparisons}</p>
        <p className="mt-2 whitespace-pre-wrap">{trend.significant_changes}</p>
        {trend.conclusions.length > 0 ? (
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {trend.conclusions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </ExpandableDetails>

      <ConfidenceIndicator
        value={trend.confidence_score}
        reasoning={trend.confidence_reasoning}
      />
    </AnalysisSection>
  );
}
