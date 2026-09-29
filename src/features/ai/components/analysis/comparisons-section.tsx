"use client";

import type {
  DataAnalysisResult,
  PeriodComparison,
  TrendAnalysisResult,
} from "@/features/ai/types";
import {
  formatNumber,
  formatPercent,
  formatSignedChange,
  trendDirectionLabel,
} from "@/features/ai/components/analysis/format";
import {
  AnalysisSection,
  ExpandableDetails,
} from "@/features/ai/components/analysis/analysis-section";

export function ComparisonsSection({
  analysis,
  trend,
}: {
  analysis?: DataAnalysisResult | null;
  trend?: TrendAnalysisResult | null;
}) {
  const structured = trend?.series.comparisons ?? [];
  const narrative = analysis?.comparisons?.trim() || trend?.period_comparisons?.trim();

  if (structured.length === 0 && !narrative) {
    return null;
  }

  return (
    <AnalysisSection
      id="analysis-comparisons"
      title="Comparisons"
      description="Period and segment comparisons returned by the analysis."
    >
      {narrative ? (
        <p className="text-[13px] leading-relaxed text-text-2 whitespace-pre-wrap">
          {narrative}
        </p>
      ) : null}

      {structured.length > 0 ? (
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="w-full min-w-[520px] border-collapse text-left text-[12.5px]">
            <caption className="sr-only">
              Period comparisons
              {trend?.series.value_column
                ? ` for ${trend.series.value_column}`
                : ""}
            </caption>
            <thead className="bg-sunken text-[11px] uppercase tracking-wide text-text-3">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Previous
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Current
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Previous value
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Current value
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Change
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Direction
                </th>
              </tr>
            </thead>
            <tbody>
              {structured.map((row) => (
                <ComparisonRow key={`${row.previous_period}-${row.period}`} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {analysis?.conclusions && analysis.conclusions.length > 0 ? (
        <ExpandableDetails summary="Analysis conclusions">
          <ul className="list-disc space-y-1 pl-5">
            {analysis.conclusions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </ExpandableDetails>
      ) : null}
    </AnalysisSection>
  );
}

function ComparisonRow({ row }: { row: PeriodComparison }) {
  const pct = formatPercent(row.percent_change);
  const abs = formatSignedChange(row.absolute_change);
  return (
    <tr className="border-t border-border">
      <td className="px-3 py-2 text-text-1">{row.previous_period}</td>
      <td className="px-3 py-2 text-text-1">{row.period}</td>
      <td className="px-3 py-2 font-mono-tabular text-text-2">
        {formatNumber(row.previous_value)}
      </td>
      <td className="px-3 py-2 font-mono-tabular text-text-2">
        {formatNumber(row.value)}
      </td>
      <td className="px-3 py-2 font-mono-tabular text-text-2">
        {pct ?? abs ?? "—"}
        {row.significant ? (
          <span className="ml-1 text-[10.5px] font-semibold uppercase text-text-3">
            notable
          </span>
        ) : null}
      </td>
      <td className="px-3 py-2 text-text-2">
        {trendDirectionLabel(row.direction)}
      </td>
    </tr>
  );
}
