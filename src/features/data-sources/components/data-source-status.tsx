import { Badge } from "@/components/ui/badge";
import type { DataSourceStatus } from "@/features/data-sources/types";

export function dataSourceTypeLabel(type: string): string {
  if (type === "POSTGRESQL") {
    return "PostgreSQL";
  }
  return type
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatTimestamp(value: string | null): string {
  if (!value) {
    return "Never";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export function DataSourceStatusBadge({
  status,
  testing = false,
}: {
  status: DataSourceStatus | string;
  testing?: boolean;
}) {
  if (testing) {
    return <Badge tone="processing">Testing</Badge>;
  }

  if (status === "ACTIVE") {
    return <Badge tone="ready">Connected</Badge>;
  }
  if (status === "ERROR") {
    return <Badge tone="failed">Failed</Badge>;
  }
  if (status === "INACTIVE") {
    return <Badge>Not tested</Badge>;
  }
  return <Badge>Unknown</Badge>;
}
