"use client";

import { hasPhase8Analysis } from "@/features/ai/api";
import { derivePrimaryAnswer } from "@/features/ai/answer-body";
import { AnalystContent } from "@/features/ai/components/analyst-content";
import { AnomaliesSection } from "@/features/ai/components/analysis/anomalies-section";
import { ComparisonsSection } from "@/features/ai/components/analysis/comparisons-section";
import { ConfidenceIndicator } from "@/features/ai/components/analysis/confidence-indicator";
import { DataAnalystSection } from "@/features/ai/components/analysis/data-analyst-section";
import { EvaluationSection } from "@/features/ai/components/analysis/evaluation-section";
import { EvidenceSection } from "@/features/ai/components/analysis/evidence-section";
import { InsightsSection } from "@/features/ai/components/analysis/insight-card";
import { KpiGrid } from "@/features/ai/components/analysis/kpi-grid";
import { RecommendationsSection } from "@/features/ai/components/analysis/recommendations-section";
import { RootCausesSection } from "@/features/ai/components/analysis/root-causes-section";
import {
  AnalysisQueryPreviewPanel,
  AnalysisSqlPanel,
} from "@/features/ai/components/analysis/sql-preview-panels";
import { TrendsSection } from "@/features/ai/components/analysis/trends-section";
import { AnalysisTimeline } from "@/features/ai/components/analysis/analysis-timeline";
import { ExpandableDetails } from "@/features/ai/components/analysis/analysis-section";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  Phase8Analysis,
  ResolvedMetadataContext,
} from "@/features/ai/types";

function FactsBody({ facts }: { facts: string[] }) {
  if (facts.length === 0) {
    return null;
  }
  const [headline, ...rest] = facts;
  return (
    <div className="space-y-2">
      <p className="text-[14px] font-semibold leading-snug text-text-1">
        {headline}
      </p>
      {rest.length > 0 ? (
        <ul className="list-disc space-y-1 pl-5 text-[13.5px] leading-relaxed text-text-1">
          {rest.map((fact, index) => (
            <li key={`${index}-${fact.slice(0, 24)}`}>{fact}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function SecondaryPanels({ analysis }: { analysis: Phase8Analysis }) {
  const understood = analysis.question_understood?.trim();
  const dateRange = analysis.date_range?.trim();
  const assumptions = analysis.assumptions?.filter((a) => a.trim()) ?? [];
  const notes = analysis.notes?.filter((n) => n.trim()) ?? [];
  const sql = analysis.sql?.trim();
  const chartHint = analysis.chart_hint?.trim();

  return (
    <div className="space-y-2">
      {understood || dateRange ? (
        <ExpandableDetails summary="How I understood this">
          {understood ? (
            <p>
              <span className="font-semibold text-text-1">Question: </span>
              {understood}
            </p>
          ) : null}
          {dateRange ? (
            <p>
              <span className="font-semibold text-text-1">Date range: </span>
              {dateRange}
            </p>
          ) : null}
        </ExpandableDetails>
      ) : null}

      {sql ? <AnalysisSqlPanel sql={sql} /> : null}

      {assumptions.length > 0 ? (
        <ExpandableDetails summary="Assumptions">
          <ul className="list-disc space-y-1 pl-5">
            {assumptions.map((item, index) => (
              <li key={`${index}-${item.slice(0, 24)}`}>{item}</li>
            ))}
          </ul>
        </ExpandableDetails>
      ) : null}

      {analysis.query_preview ? (
        <AnalysisQueryPreviewPanel preview={analysis.query_preview} />
      ) : null}

      {notes.length > 0 || chartHint ? (
        <ExpandableDetails summary="Notes">
          {chartHint ? (
            <p>
              <span className="font-semibold text-text-1">Chart: </span>
              {chartHint}
            </p>
          ) : null}
          {notes.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5">
              {notes.map((item, index) => (
                <li key={`${index}-${item.slice(0, 24)}`}>{item}</li>
              ))}
            </ul>
          ) : null}
        </ExpandableDetails>
      ) : null}
    </div>
  );
}

function hasAgentSections(analysis: Phase8Analysis): boolean {
  return Boolean(
    analysis.data_analyst ||
      analysis.trend ||
      analysis.anomaly ||
      analysis.root_cause ||
      analysis.insight ||
      analysis.recommendation ||
      analysis.evaluation,
  );
}

/**
 * Chat-facing analysis panel: answer first, technical details collapsed.
 * Agent sections (when present) follow below the primary answer.
 */
export function AnalysisReport({
  analysis,
  narrative,
  metadata,
}: {
  analysis: Phase8Analysis;
  narrative?: string | null;
  metadata?: ResolvedMetadataContext | null;
}) {
  if (!hasPhase8Analysis(analysis)) {
    return null;
  }

  const { facts, text } = derivePrimaryAnswer(analysis, narrative ?? "");
  const agents = hasAgentSections(analysis);

  const topInsight = analysis.insight?.top_insight;
  const topRecommendation = analysis.recommendation?.top_recommendation;
  const executive =
    analysis.insight?.summary ||
    analysis.data_analyst?.interpretation ||
    analysis.trend?.summary ||
    null;

  const overallConfidence =
    analysis.insight?.confidence_score ||
    analysis.recommendation?.confidence_score ||
    analysis.data_analyst?.confidence_score ||
    analysis.trend?.confidence_score ||
    analysis.anomaly?.confidence_score ||
    analysis.root_cause?.confidence_score ||
    null;

  return (
    <article
      className="max-h-[min(70vh,640px)] space-y-4 overflow-y-auto"
      aria-label="Analysis report"
    >
      <div className="space-y-3">
        {facts.length > 0 ? (
          <FactsBody facts={facts} />
        ) : text ? (
          <AnalystContent text={text} />
        ) : executive ? (
          <p className="text-[13.5px] leading-relaxed text-text-1">{executive}</p>
        ) : null}

        <SecondaryPanels analysis={analysis} />
      </div>

      {agents ? (
        <div className="space-y-6 border-t border-border pt-4">
          <header className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">
              Analysis
            </p>
            {overallConfidence ? (
              <ConfidenceIndicator value={overallConfidence} size="md" />
            ) : null}
          </header>

          {(topInsight || topRecommendation) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {topInsight ? (
                <p className="rounded-md border border-border bg-[linear-gradient(135deg,var(--signal-tint),transparent_70%)] px-3.5 py-3 text-[13px] text-text-1">
                  <span className="block text-[11px] font-semibold uppercase tracking-wide text-text-3">
                    Top insight
                  </span>
                  {topInsight}
                </p>
              ) : null}
              {topRecommendation ? (
                <p className="rounded-md border border-border bg-sunken/50 px-3.5 py-3 text-[13px] text-text-1">
                  <span className="block text-[11px] font-semibold uppercase tracking-wide text-text-3">
                    Top recommendation
                  </span>
                  {topRecommendation}
                </p>
              ) : null}
            </div>
          )}

          <KpiGrid
            metrics={analysis.insight?.key_metrics ?? []}
            comparisons={analysis.trend?.series.significant_changes}
            valueColumn={analysis.trend?.series.value_column}
            overallConfidence={analysis.insight?.confidence_score}
          />

          {analysis.data_analyst ? (
            <DataAnalystSection analyst={analysis.data_analyst} />
          ) : null}

          {analysis.trend ? (
            <TrendsSection
              trend={analysis.trend}
              anomalies={analysis.anomaly?.scan.anomalies}
            />
          ) : null}

          <ComparisonsSection
            analysis={analysis.data_analyst}
            trend={analysis.trend}
          />

          {analysis.anomaly ? (
            <AnomaliesSection anomalies={analysis.anomaly} />
          ) : null}

          {analysis.root_cause ? (
            <RootCausesSection rootCause={analysis.root_cause} />
          ) : null}

          {analysis.insight ? (
            <InsightsSection insights={analysis.insight} />
          ) : null}

          {analysis.recommendation ? (
            <RecommendationsSection recommendations={analysis.recommendation} />
          ) : null}

          <EvidenceSection analysis={analysis} metadata={metadata} />

          <AnalysisTimeline analysis={analysis} />

          {analysis.evaluation ? (
            <EvaluationSection evaluation={analysis.evaluation} />
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function AnalysisReportSkeleton({
  label = "Preparing analysis…",
}: {
  label?: string;
}) {
  return (
    <div className="space-y-4" role="status" aria-live="polite" aria-busy="true">
      <p className="text-[13px] text-text-3">{label}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[88px] rounded-md" />
        ))}
      </div>
      <Skeleton className="h-24 w-full rounded-md" />
      <Skeleton className="h-32 w-full rounded-md" />
    </div>
  );
}
