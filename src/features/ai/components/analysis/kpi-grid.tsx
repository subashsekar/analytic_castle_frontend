"use client";

import type { AnalysisConfidence, KeyMetric, PeriodComparison } from "@/features/ai/types";
import { ConfidenceIndicator } from "@/features/ai/components/analysis/confidence-indicator";
import {
  changeDirection,
  formatNumber,
  formatPercent,
  formatSignedChange,
  trendDirectionLabel,
} from "@/features/ai/components/analysis/format";
import { AnalysisSection } from "@/features/ai/components/analysis/analysis-section";

type KpiCardModel = {
  id: string;
  label: string;
  value: string;
  context?: string;
  changeLabel?: string | null;
  changeDirection?: "up" | "down" | "neutral" | "unavailable";
  period?: string | null;
  confidence?: AnalysisConfidence | null;
};

function fromKeyMetric(metric: KeyMetric): KpiCardModel {
  return {
    id: `metric-${metric.column}`,
    label: metric.column,
    value: formatNumber(metric.total),
    context: `Avg ${formatNumber(metric.average)} · Min ${formatNumber(metric.minimum)} · Max ${formatNumber(metric.maximum)} · n=${metric.value_count}`,
  };
}

function fromPeriodComparison(
  comparison: PeriodComparison,
  valueColumn: string | null,
): KpiCardModel {
  const pct = formatPercent(comparison.percent_change);
  const abs = formatSignedChange(comparison.absolute_change);
  return {
    id: `cmp-${comparison.period}-${comparison.previous_period}`,
    label: valueColumn ?? "Metric",
    value: formatNumber(comparison.value),
    changeLabel: pct ?? abs,
    changeDirection: changeDirection(
      comparison.percent_change ?? comparison.absolute_change,
    ),
    period: `${comparison.previous_period} → ${comparison.period}`,
    context: `Previous ${formatNumber(comparison.previous_value)} · ${trendDirectionLabel(comparison.direction)}`,
  };
}

export function KpiGrid({
  metrics,
  comparisons,
  valueColumn,
  overallConfidence,
}: {
  metrics: KeyMetric[];
  comparisons?: PeriodComparison[];
  valueColumn?: string | null;
  overallConfidence?: AnalysisConfidence | null;
}) {
  const cards: KpiCardModel[] = [
    ...metrics.map(fromKeyMetric),
    ...(comparisons ?? [])
      .filter((item) => item.significant)
      .slice(0, 4)
      .map((item) => fromPeriodComparison(item, valueColumn ?? null)),
  ];

  if (cards.length === 0) {
    return null;
  }

  return (
    <AnalysisSection id="analysis-kpis" title="KPI Summary">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.id}
            className="rounded-md border border-border bg-surface px-3.5 py-3"
          >
            <p className="mb-2 text-[12px] text-text-3">{card.label}</p>
            <p className="font-mono-tabular text-[26px] font-bold tracking-tight text-text-1">
              {card.value}
            </p>
            {card.changeLabel ? (
              <p
                className={`mt-2 flex items-center gap-1 text-[12px] font-semibold ${
                  card.changeDirection === "up"
                    ? "text-text-2"
                    : card.changeDirection === "down"
                      ? "text-text-2"
                      : "text-text-3"
                }`}
                aria-label={`Change ${card.changeLabel}${
                  card.period ? ` for ${card.period}` : ""
                }`}
              >
                <span aria-hidden>
                  {card.changeDirection === "up"
                    ? "↑"
                    : card.changeDirection === "down"
                      ? "↓"
                      : card.changeDirection === "neutral"
                        ? "→"
                        : ""}
                </span>
                {card.changeLabel}
                {card.period ? (
                  <span className="font-normal text-text-3"> · {card.period}</span>
                ) : null}
              </p>
            ) : null}
            {card.context ? (
              <p className="mt-2 text-[11.5px] leading-snug text-text-3">{card.context}</p>
            ) : null}
          </article>
        ))}
      </div>
      {overallConfidence ? (
        <div className="pt-1">
          <ConfidenceIndicator value={overallConfidence} />
        </div>
      ) : null}
    </AnalysisSection>
  );
}
