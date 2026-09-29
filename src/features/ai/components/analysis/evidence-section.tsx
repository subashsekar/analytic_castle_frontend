"use client";

import type {
  Phase8Analysis,
  ResolvedMetadataContext,
} from "@/features/ai/types";
import {
  AnalysisSection,
  ExpandableDetails,
} from "@/features/ai/components/analysis/analysis-section";

type EvidenceItem = {
  id: string;
  title: string;
  description: string;
  source?: string | null;
  metric?: string | null;
  period?: string | null;
  sql?: string | null;
  rowSummary?: string | null;
};

function collectEvidence(
  analysis: Phase8Analysis,
  metadata?: ResolvedMetadataContext | null,
): EvidenceItem[] {
  const items: EvidenceItem[] = [];

  analysis.insight?.insights.forEach((insight, index) => {
    items.push({
      id: `insight-ev-${index}`,
      title: insight.title,
      description: insight.supporting_evidence,
      metric: insight.metric,
    });
  });

  analysis.root_cause?.evidence.forEach((ev, index) => {
    // Prefer summaries — do not dump raw customer rows in the primary UI.
    const rowSummary = ev.executed
      ? `Supporting query returned ${ev.row_count} row(s)${ev.truncated ? " (truncated)" : ""}.`
      : "Supporting query was not executed.";
    items.push({
      id: `rca-ev-${index}`,
      title: ev.question,
      description: ev.note || rowSummary,
      sql: ev.sql,
      rowSummary,
    });
  });

  analysis.anomaly?.scan.anomalies.forEach((anomaly, index) => {
    items.push({
      id: `anomaly-ev-${index}`,
      title: `${anomaly.column} anomaly`,
      description: anomaly.evidence,
      metric: anomaly.column,
      period: anomaly.period,
    });
  });

  analysis.recommendation?.recommendations.forEach((rec, index) => {
    items.push({
      id: `rec-ev-${index}`,
      title: rec.title,
      description: rec.supporting_evidence,
      metric: rec.evidence_reference,
    });
  });

  metadata?.tables.slice(0, 8).forEach((table) => {
    items.push({
      id: `src-${table.table_id}`,
      title: `${table.schema_name}.${table.table_name}`,
      description: `Catalog table matched for this analysis (${table.match_reason}).`,
      source: table.table_name,
    });
  });

  return items;
}

export function EvidenceSection({
  analysis,
  metadata,
}: {
  analysis: Phase8Analysis;
  metadata?: ResolvedMetadataContext | null;
}) {
  const items = collectEvidence(analysis, metadata);
  const gaps = [
    ...(analysis.insight?.data_gaps ?? []),
    ...(analysis.recommendation?.data_gaps ?? []),
  ];
  const notes = [
    ...(analysis.insight?.notes ?? []),
    ...(analysis.root_cause?.notes ?? []),
    ...(analysis.recommendation?.notes ?? []),
  ];

  if (items.length === 0 && gaps.length === 0 && notes.length === 0) {
    return null;
  }

  return (
    <AnalysisSection
      id="phase8-evidence"
      title="Evidence & Sources"
      description="Where the findings came from — metrics, catalog sources, and supporting queries."
    >
      {items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-sm border border-border bg-sunken/40 px-3 py-2.5"
            >
              <p className="text-[13px] font-semibold text-text-1">{item.title}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-text-2">
                {item.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-text-3">
                {item.source ? <span>Source: {item.source}</span> : null}
                {item.metric ? <span>Metric: {item.metric}</span> : null}
                {item.period ? <span>Period: {item.period}</span> : null}
              </div>
              {item.sql ? (
                <ExpandableDetails summary="View query reference">
                  <pre className="overflow-x-auto font-mono text-[11.5px] leading-relaxed text-text-1">
                    <code>{item.sql}</code>
                  </pre>
                  {item.rowSummary ? (
                    <p className="mt-2 text-[11.5px] text-text-3">{item.rowSummary}</p>
                  ) : null}
                </ExpandableDetails>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {gaps.length > 0 ? (
        <ExpandableDetails summary="Data gaps">
          <ul className="list-disc space-y-1 pl-5">
            {gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </ExpandableDetails>
      ) : null}

      {notes.length > 0 ? (
        <ExpandableDetails summary="Notes">
          <ul className="list-disc space-y-1 pl-5">
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </ExpandableDetails>
      ) : null}
    </AnalysisSection>
  );
}
