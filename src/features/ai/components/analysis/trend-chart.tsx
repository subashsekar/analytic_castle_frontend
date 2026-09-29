"use client";

import type { Anomaly, TrendAnalysisResult } from "@/features/ai/types";
import { formatNumber } from "@/features/ai/components/analysis/format";

type ChartPoint = {
  period: string;
  value: number;
};

/** Build chart points only from deterministic series evidence — never LLM prose. */
export function buildTrendPoints(trend: TrendAnalysisResult): ChartPoint[] {
  const series = trend.series;
  if (series.direction === "INSUFFICIENT_DATA" || series.point_count < 1) {
    return [];
  }

  const byPeriod = new Map<string, number>();
  if (series.first_period != null && series.first_value != null) {
    byPeriod.set(series.first_period, series.first_value);
  }
  for (const cmp of series.comparisons) {
    byPeriod.set(cmp.previous_period, cmp.previous_value);
    byPeriod.set(cmp.period, cmp.value);
  }
  if (series.last_period != null && series.last_value != null) {
    byPeriod.set(series.last_period, series.last_value);
  }

  return Array.from(byPeriod.entries()).map(([period, value]) => ({
    period,
    value,
  }));
}

export function TrendSeriesChart({
  trend,
  anomalies = [],
}: {
  trend: TrendAnalysisResult;
  anomalies?: Anomaly[];
}) {
  const points = buildTrendPoints(trend);

  if (points.length === 0 || trend.direction === "INSUFFICIENT_DATA") {
    return (
      <p
        className="rounded-sm border border-dashed border-border bg-sunken/40 px-3 py-6 text-center text-[12.5px] text-text-3"
        role="status"
      >
        Insufficient series data to chart this trend.
      </p>
    );
  }

  const width = 560;
  const height = 160;
  const padX = 28;
  const padY = 20;
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const coords = points.map((point, index) => {
    const x =
      padX +
      (points.length === 1
        ? (width - padX * 2) / 2
        : (index / (points.length - 1)) * (width - padX * 2));
    const y = padY + (1 - (point.value - min) / span) * (height - padY * 2);
    return { ...point, x, y };
  });

  const path = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");

  const anomalyPeriods = new Set(
    anomalies
      .map((a) => a.period)
      .filter((p): p is string => Boolean(p)),
  );

  return (
    <figure className="overflow-x-auto rounded-sm border border-border bg-surface p-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-40 w-full min-w-[280px]"
        role="img"
        aria-label={`Trend of ${trend.series.value_column ?? "metric"} across ${points.length} periods`}
      >
        <path
          d={path}
          fill="none"
          stroke="var(--signal)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {coords.map((c) => {
          const isAnomaly = anomalyPeriods.has(c.period);
          return (
            <g key={c.period}>
              <circle
                cx={c.x}
                cy={c.y}
                r={isAnomaly ? 5 : 3.5}
                fill={isAnomaly ? "var(--warning)" : "var(--signal)"}
              />
              <title>
                {c.period}: {formatNumber(c.value)}
                {isAnomaly ? " (anomaly)" : ""}
              </title>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-1 flex flex-wrap justify-between gap-2 px-1 text-[11px] text-text-3">
        <span>{coords[0]?.period}</span>
        <span className="font-mono-tabular">
          {trend.series.value_column ?? "value"}
        </span>
        <span>{coords[coords.length - 1]?.period}</span>
      </figcaption>
    </figure>
  );
}
