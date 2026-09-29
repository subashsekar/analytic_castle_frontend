"use client";

export function AnalystStatus({ label = "Analyzing…" }: { label?: string }) {
  return (
    <div className="flex items-start gap-3" aria-live="polite" aria-atomic="true">
      <span
        className="flex size-[30px] shrink-0 items-center justify-center rounded-[9px] bg-ink-950 text-[11px] font-bold text-signal-dark-text"
        aria-hidden
      >
        AC
      </span>
      <div className="rounded-[4px_14px_14px_14px] border border-border bg-surface px-4 py-3 text-[13.5px] text-text-3">
        <span className="inline-flex items-center gap-2">
          <span className="ai-thinking-dots" aria-hidden>
            <span />
            <span />
            <span />
          </span>
          {label}
        </span>
      </div>
    </div>
  );
}
