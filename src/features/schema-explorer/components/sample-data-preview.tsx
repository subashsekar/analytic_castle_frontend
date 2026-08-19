"use client";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { metadataErrorMessage } from "@/features/schema-explorer/errors";
import { sensitivityLabel } from "@/features/schema-explorer/labels";
import {
  SAMPLE_DATA_DEFAULT_LIMIT,
  SAMPLE_DATA_LIMITS,
  type SampleData,
} from "@/features/schema-explorer/types";

export function SampleDataPreview({
  sample,
  loading,
  error,
  enabled,
  limit,
  onLimitChange,
  onPreview,
}: {
  sample: SampleData | undefined;
  loading: boolean;
  error: unknown;
  enabled: boolean;
  limit: number;
  onLimitChange: (limit: number) => void;
  onPreview: () => void;
}) {
  if (!enabled) {
    return (
      <p className="py-8 text-center text-[13.5px] font-semibold text-text-1">
        Sample preview is not supported yet for this connector type.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-28">
          <label
            htmlFor="sample-limit"
            className="mb-1 block text-[11.5px] font-semibold uppercase tracking-[0.03em] text-text-3"
          >
            Row limit
          </label>
          <Select
            id="sample-limit"
            value={String(limit)}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            disabled={loading}
          >
            {SAMPLE_DATA_LIMITS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </div>
        <Button onClick={onPreview} disabled={loading} loading={loading}>
          {loading ? "Loading sample…" : "Preview sample"}
        </Button>
      </div>

      {error ? <Alert>{metadataErrorMessage(error)}</Alert> : null}

      {loading && !sample ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Spinner label="Loading sample data" />
        </div>
      ) : null}

      {sample ? <SampleGrid sample={sample} /> : null}

      {!sample && !loading && !error ? (
        <p className="py-6 text-[13px] text-text-3">
          Preview up to {SAMPLE_DATA_DEFAULT_LIMIT} masked rows from the
          connected database. Sensitive values stay redacted.
        </p>
      ) : null}
    </div>
  );
}

function SampleGrid({ sample }: { sample: SampleData }) {
  if (sample.row_count === 0 || sample.rows.length === 0) {
    return (
      <p className="py-8 text-center text-[13.5px] font-semibold text-text-1">
        This table has no rows.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[12px] text-text-3">
        Showing {sample.row_count} of up to {sample.row_limit} sample rows.
        {sample.truncated_columns
          ? " More than 100 columns exist; extra columns were omitted."
          : ""}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-[13px]">
          <thead>
            <tr>
              {sample.columns.map((column) => (
                <th
                  key={column.name}
                  className="border-b border-border-strong bg-sunken px-3.5 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-[0.03em] text-text-3"
                >
                  <span className="font-mono normal-case tracking-normal">
                    {column.name}
                  </span>
                  <span className="mt-1 flex flex-wrap gap-1 font-sans normal-case tracking-normal">
                    {column.sensitivity !== "PUBLIC" ? (
                      <Badge
                        tone={
                          column.sensitivity === "SECRET"
                            ? "failed"
                            : "processing"
                        }
                      >
                        {sensitivityLabel(column.sensitivity)}
                      </Badge>
                    ) : null}
                    {column.masked ? <Badge>Masked</Badge> : null}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sample.rows.map((row, index) => (
              <tr key={index} className="hover:bg-sunken">
                {sample.columns.map((column) => (
                  <td
                    key={column.name}
                    className="border-b border-border px-3.5 py-[11px] font-mono text-[12.5px] text-text-1"
                  >
                    {formatSampleValue(row[column.name])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatSampleValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return "[UNAVAILABLE]";
  }
}
