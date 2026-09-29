"use client";

import type { ReactNode } from "react";

export function AnalysisSection({
  id,
  title,
  children,
  description,
}: {
  id: string;
  title: string;
  children: ReactNode;
  description?: string;
}) {
  return (
    <section aria-labelledby={id} className="space-y-3">
      <div className="border-b border-border pb-2">
        <h3 id={id} className="text-[15px] font-semibold tracking-tight text-text-1">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 text-[12.5px] leading-relaxed text-text-2">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function ExpandableDetails({
  summary,
  children,
  defaultOpen = false,
}: {
  summary: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="group rounded-sm border border-border bg-sunken/40 open:bg-sunken/60"
      open={defaultOpen || undefined}
    >
      <summary className="ac-focus-ring cursor-pointer list-none rounded-sm px-3 py-2 text-[12.5px] font-semibold text-text-1 marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex w-full items-center justify-between gap-2">
          {summary}
          <span
            className="text-text-3 transition-transform group-open:rotate-180"
            aria-hidden
          >
            ▾
          </span>
        </span>
      </summary>
      <div className="space-y-2 border-t border-border px-3 py-3 text-[12.5px] leading-relaxed text-text-2">
        {children}
      </div>
    </details>
  );
}
