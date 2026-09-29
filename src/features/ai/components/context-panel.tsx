"use client";

import type { AIChatResponse } from "@/features/ai/types";

function intentLabel(type: string): string {
  return type
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function capabilityLabel(value: string): string {
  const labels: Record<string, string> = {
    METADATA: "Catalog metadata",
    DATABASE: "Database access",
    SAMPLE_DATA: "Sample data",
    AGGREGATION: "Aggregation",
    TIME_FILTER: "Time filter",
    RELATIONSHIPS: "Relationships",
  };
  return labels[value] ?? intentLabel(value);
}

export function ContextPanel({
  selectedName,
  response,
}: {
  selectedName: string | null;
  response: AIChatResponse | undefined;
}) {
  if (!selectedName) {
    return (
      <p className="text-[13px] text-text-3">
        Choose a data source to see related catalog context after each answer.
      </p>
    );
  }

  if (!response) {
    return (
      <div className="space-y-3">
        <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-text-3">
          Data in context
        </h2>
        <div className="rounded-sm border border-signal/30 bg-signal-tint px-3 py-2.5 text-[13px] font-semibold text-text-1">
          {selectedName}
        </div>
        <p className="text-[12.5px] text-text-3">
          Related tables and columns appear here after you send a question.
        </p>
      </div>
    );
  }

  const { intent, plan, metadata_context: context } = response;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-text-3">
          Data in context
        </h2>
        <div className="mt-2 rounded-sm border border-signal/30 bg-signal-tint px-3 py-2.5 text-[13px] font-semibold text-text-1">
          {selectedName}
        </div>
      </div>

      <div>
        <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-text-3">
          Intent
        </h2>
        <p className="mt-2 text-[13px] font-semibold text-text-1">
          {intentLabel(intent.type)}
        </p>
        {intent.subject ? (
          <p className="mt-1 text-[12.5px] text-text-3">{intent.subject}</p>
        ) : null}
      </div>

      {plan.required_capabilities.length > 0 ? (
        <div>
          <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-text-3">
            Needed capabilities
          </h2>
          <ul className="mt-2 space-y-1">
            {plan.required_capabilities.map((item) => (
              <li key={item} className="text-[12.5px] text-text-2">
                {capabilityLabel(item)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-text-3">
          Related tables
        </h2>
        {context.tables.length === 0 ? (
          <p className="mt-2 text-[12.5px] text-text-3">None resolved yet.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {context.tables.slice(0, 8).map((table) => (
              <li
                key={table.table_id}
                className="font-mono text-[12.5px] text-text-1"
              >
                {table.schema_name}.{table.table_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-text-3">
          Related columns
        </h2>
        {context.columns.length === 0 ? (
          <p className="mt-2 text-[12.5px] text-text-3">None resolved yet.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {context.columns.slice(0, 10).map((column) => (
              <li
                key={column.column_id}
                className="font-mono text-[12.5px] text-text-1"
              >
                {column.schema_name}.{column.table_name}.{column.column_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {context.unresolved_concepts.length > 0 ? (
        <div>
          <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-text-3">
            Unresolved concepts
          </h2>
          <p className="mt-2 text-[12.5px] text-text-2">
            {context.unresolved_concepts.join(", ")}
          </p>
        </div>
      ) : null}
    </div>
  );
}
