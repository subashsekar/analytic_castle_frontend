import { api } from "@/lib/api/client";
import { healthPaths } from "@/lib/api/paths";
import { asTrimmedString, isRecord } from "@/lib/utils/unknown";

export type HealthStatus = {
  status: string;
  database?: string;
};

function normalizeHealth(raw: unknown): HealthStatus {
  if (!isRecord(raw)) {
    return { status: "unknown" };
  }
  return {
    status: asTrimmedString(raw.status) ?? "unknown",
    database: asTrimmedString(raw.database),
  };
}

/** Process liveness (no database query). */
export async function getLiveness(): Promise<HealthStatus> {
  const { data } = await api.get(healthPaths.live, { skipAuthRefresh: true });
  return normalizeHealth(data);
}

/** Application + database readiness. */
export async function getReadiness(): Promise<HealthStatus> {
  const { data } = await api.get(healthPaths.ready, { skipAuthRefresh: true });
  return normalizeHealth(data);
}

/** Same payload as readiness. */
export async function getHealth(): Promise<HealthStatus> {
  const { data } = await api.get(healthPaths.health, { skipAuthRefresh: true });
  return normalizeHealth(data);
}

export async function getRootStatus(): Promise<HealthStatus> {
  const { data } = await api.get(healthPaths.root, { skipAuthRefresh: true });
  return normalizeHealth(data);
}
