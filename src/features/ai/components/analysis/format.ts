import type {
  AnalysisConfidence,
  AnomalySeverity,
  AnomalyType,
  InsightPriority,
  RecommendationLevel,
  TrendDirection,
} from "@/features/ai/types";

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  if (value === 0) {
    return "0";
  }
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    return `${trimTrailingZero(value / 1_000_000_000)}B`;
  }
  if (abs >= 1_000_000) {
    return `${trimTrailingZero(value / 1_000_000)}M`;
  }
  if (abs >= 10_000) {
    return `${trimTrailingZero(value / 1_000)}K`;
  }
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: abs < 1 ? 4 : 2,
  }).format(value);
}

function trimTrailingZero(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number | null | undefined): string | null {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

export function formatSignedChange(value: number | null | undefined): string | null {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value)}`;
}

export function confidenceLabel(value: AnalysisConfidence | string | null | undefined): string {
  switch ((value ?? "").toString().toUpperCase()) {
    case "HIGH":
      return "HIGH";
    case "MEDIUM":
      return "MEDIUM";
    case "LOW":
      return "LOW";
    default:
      return "UNKNOWN";
  }
}

export function priorityLabel(value: InsightPriority | RecommendationLevel | string): string {
  return confidenceLabel(value);
}

export function trendDirectionLabel(direction: TrendDirection): string {
  switch (direction) {
    case "INCREASING":
      return "Increasing";
    case "DECREASING":
      return "Decreasing";
    case "STABLE":
      return "Stable";
    case "VOLATILE":
      return "Fluctuating";
    case "INSUFFICIENT_DATA":
      return "Insufficient data";
    default:
      return "Unknown";
  }
}

export function anomalyTypeLabel(type: AnomalyType): string {
  switch (type) {
    case "STATISTICAL_OUTLIER":
      return "Statistical outlier";
    case "UNEXPECTED_CHANGE":
      return "Unexpected change";
    case "THRESHOLD_BREACH":
      return "Threshold breach";
    default:
      return "Anomaly";
  }
}

export function severityLabel(severity: AnomalySeverity | string): string {
  return confidenceLabel(severity);
}

/** Direction-only styling — does not imply good/bad. */
export function changeDirection(
  value: number | null | undefined,
): "up" | "down" | "neutral" | "unavailable" {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "unavailable";
  }
  if (value > 0) {
    return "up";
  }
  if (value < 0) {
    return "down";
  }
  return "neutral";
}
