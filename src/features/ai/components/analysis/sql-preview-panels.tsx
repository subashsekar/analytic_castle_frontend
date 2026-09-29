"use client";

import { useState } from "react";
import { Check, Clipboard } from "lucide-react";
import type { AIQueryPreview } from "@/features/ai/types";
import { ExpandableDetails } from "@/features/ai/components/analysis/analysis-section";

const PREVIEW_ROW_CAP = 10;

function formatCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function CopySqlButton({ sql }: { sql: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(sql.trim());
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Clipboard may be unavailable in locked-down contexts.
        }
      }}
      className="ac-focus-ring inline-flex items-center gap-1 rounded-[4px] px-2 py-1 text-[12px] text-text-3 hover:bg-sunken hover:text-text-1"
    >
      {copied ? (
        <>
          <Check size={13} className="text-emerald-500" />
          <span className="text-emerald-500">Copied</span>
        </>
      ) : (
        <>
          <Clipboard size={13} />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

/** Collapsed-by-default SQL block for chat bubbles. */
export function AnalysisSqlPanel({ sql }: { sql: string }) {
  const clean = sql.trim();
  if (!clean) {
    return null;
  }

  return (
    <ExpandableDetails summary="SQL">
      <div className="flex justify-end">
        <CopySqlButton sql={clean} />
      </div>
      <pre className="max-h-[200px] overflow-auto rounded-sm border border-border bg-surface p-3 font-mono text-[12px] leading-relaxed text-text-1 whitespace-pre">
        <code>{clean}</code>
      </pre>
    </ExpandableDetails>
  );
}

export function AnalysisQueryPreviewPanel({
  preview,
}: {
  preview: AIQueryPreview;
}) {
  const columns =
    preview.columns.length > 0
      ? preview.columns
      : (preview.sample_rows[0]?.map((_, i) => `col_${i + 1}`) ?? []);
  const rows = preview.sample_rows.slice(0, PREVIEW_ROW_CAP);

  return (
    <ExpandableDetails summary="Data preview">
      <p className="text-[12px] text-text-3">
        {preview.truncated
          ? `Showing ${rows.length} of ${preview.row_count} row(s) (truncated).`
          : `Showing ${rows.length} of ${preview.row_count} row(s).`}
      </p>
      {rows.length === 0 ? (
        <p className="text-[13px] text-text-3" role="status">
          No preview rows were returned.
        </p>
      ) : (
        <div className="max-h-[200px] overflow-auto rounded-sm border border-border">
          <table className="w-full min-w-[280px] border-collapse text-left text-[12.5px]">
            <caption className="sr-only">Query result preview</caption>
            <thead className="sticky top-0 bg-sunken text-[11px] uppercase tracking-wide text-text-3">
              <tr>
                {columns.map((col) => (
                  <th key={col} scope="col" className="px-3 py-2 font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-border">
                  {columns.map((col, colIndex) => (
                    <td
                      key={`${rowIndex}-${col}`}
                      className="px-3 py-2 font-mono-tabular text-text-2"
                    >
                      {formatCell(row[colIndex])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ExpandableDetails>
  );
}
