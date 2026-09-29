"use client";

import type { AnalysisConfidence } from "@/features/ai/types";
import { confidenceLabel } from "@/features/ai/components/analysis/format";

const DOT_CLASS: Record<string, string> = {
  HIGH: "bg-success",
  MEDIUM: "bg-warning",
  LOW: "bg-error",
  UNKNOWN: "bg-text-3",
};

export function ConfidenceIndicator({
  value,
  reasoning,
  size = "sm",
}: {
  value: AnalysisConfidence | string | null | undefined;
  reasoning?: string | null;
  size?: "sm" | "md";
}) {
  const token = (value ?? "").toString().toUpperCase();
  const level = token === "HIGH" || token === "MEDIUM" || token === "LOW" ? token : "UNKNOWN";
  const label = confidenceLabel(level === "UNKNOWN" ? null : level);
  const textSize = size === "md" ? "text-[13px]" : "text-[11.5px]";

  return (
    <div className={`inline-flex flex-col gap-0.5 ${textSize}`}>
      <span
        className="inline-flex items-center gap-1.5 font-medium text-text-2"
        aria-label={`Confidence: ${label}`}
      >
        <span
          className={`inline-block size-2 shrink-0 rounded-full ${DOT_CLASS[level]}`}
          aria-hidden
        />
        <span>
          Confidence: <span className="text-text-1">{label}</span>
        </span>
      </span>
      {reasoning ? (
        <span className="max-w-prose text-[11px] leading-snug text-text-3">{reasoning}</span>
      ) : null}
    </div>
  );
}
