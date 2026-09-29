export type DataAvailability = "available" | "checking" | "degraded" | "unavailable";
export type DataHealth = "healthy" | "checking" | "degraded" | "unavailable";

export function dataAvailabilityLabel(value: DataAvailability): string {
  if (value === "available") return "Data available";
  if (value === "checking") return "Checking data…";
  if (value === "degraded") return "Limited data access";
  return "Data temporarily unavailable";
}

export function dataAvailabilityTone(
  value: DataAvailability,
): "neutral" | "ready" | "processing" | "failed" {
  if (value === "available") return "ready";
  if (value === "checking") return "processing";
  if (value === "degraded") return "neutral";
  return "failed";
}

export function dataHealthLabel(value: DataHealth): string {
  if (value === "healthy") return "Healthy";
  if (value === "checking") return "Checking data…";
  if (value === "degraded") return "Degraded";
  return "Unavailable";
}

export function dataHealthTone(
  value: DataHealth,
): "neutral" | "ready" | "processing" | "failed" {
  if (value === "healthy") return "ready";
  if (value === "checking") return "processing";
  if (value === "degraded") return "neutral";
  return "failed";
}

export type ConnectionStatus = "ACTIVE" | "INACTIVE" | "ERROR" | string;
export type MetadataSyncStatus = "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | string;

export function deriveDataAvailability({
  metadataEnabled,
  connectionStatus,
  isTesting,
  syncStatus,
  hasSchemas,
  schemasCount,
}: {
  metadataEnabled: boolean;
  connectionStatus: ConnectionStatus;
  isTesting: boolean;
  syncStatus: MetadataSyncStatus | null | undefined;
  hasSchemas?: boolean;
  schemasCount?: number | null;
}): DataAvailability {
  if (!metadataEnabled) return "unavailable";
  if (isTesting) return "checking";
  if (connectionStatus !== "ACTIVE") return "unavailable";

  if (syncStatus === "PENDING" || syncStatus === "RUNNING") return "checking";
  if (syncStatus === "SUCCESS") return "available";
  if (syncStatus === "FAILED") {
    if (hasSchemas === true) return "degraded";
    if (typeof schemasCount === "number" && schemasCount > 0) return "degraded";
    return "unavailable";
  }

  // Unknown sync state (for example, not loaded yet).
  return "checking";
}

export function deriveDataHealth({
  metadataEnabled,
  connectionStatus,
  syncStatus,
  hasSchemas,
}: {
  metadataEnabled: boolean;
  connectionStatus: ConnectionStatus;
  syncStatus: MetadataSyncStatus | null | undefined;
  hasSchemas?: boolean;
}): DataHealth {
  if (!metadataEnabled) return "unavailable";
  if (connectionStatus !== "ACTIVE") return "unavailable";

  if (syncStatus === "PENDING" || syncStatus === "RUNNING" || !syncStatus) {
    return "checking";
  }

  if (syncStatus === "SUCCESS") {
    return hasSchemas ? "healthy" : "checking";
  }

  if (syncStatus === "FAILED") {
    return hasSchemas ? "degraded" : "unavailable";
  }

  return "checking";
}

