import type {
  ColumnSensitivity,
  MetadataSyncStatus,
  RelationshipType,
  TableType,
} from "@/features/schema-explorer/types";

export function tableTypeLabel(type: TableType | string): string {
  if (type === "VIEW") {
    return "View";
  }
  if (type === "TABLE") {
    return "Table";
  }
  return type;
}

export function relationshipTypeLabel(type: RelationshipType | string): string {
  const labels: Record<string, string> = {
    ONE_TO_ONE: "One to one",
    ONE_TO_MANY: "One to many",
    MANY_TO_ONE: "Many to one",
    MANY_TO_MANY: "Many to many",
  };
  return labels[type] ?? type;
}

export function syncStatusLabel(status: MetadataSyncStatus | string): string {
  if (status === "SUCCESS") {
    return "Synced";
  }
  if (status === "RUNNING") {
    return "Syncing";
  }
  if (status === "FAILED") {
    return "Failed";
  }
  if (status === "PENDING") {
    return "Pending";
  }
  return "Unknown";
}

export function qualifyName(
  schemaName: string,
  tableName: string,
  columnName?: string,
): string {
  const table = schemaName ? `${schemaName}.${tableName}` : tableName;
  return columnName ? `${table}.${columnName}` : table;
}

export function matchesQuery(value: string, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }
  return value.toLowerCase().includes(needle);
}

export function sensitivityLabel(value: ColumnSensitivity | string): string {
  if (value === "PII") {
    return "PII";
  }
  if (value === "SECRET") {
    return "Secret";
  }
  if (value === "SENSITIVE") {
    return "Sensitive";
  }
  if (value === "PUBLIC") {
    return "Public";
  }
  return value;
}

export function searchTypeLabel(value: string): string {
  if (value === "SCHEMA") {
    return "Schema";
  }
  if (value === "TABLE") {
    return "Table";
  }
  if (value === "COLUMN") {
    return "Column";
  }
  return value;
}
