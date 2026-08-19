import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-surface px-5 py-20 text-center">
      <div
        className="mx-auto mb-5 flex h-[100px] w-[120px] items-center justify-center text-text-3"
        aria-hidden
      >
        <svg
          viewBox="0 0 120 100"
          width="120"
          height="100"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="18" y="22" width="84" height="56" rx="8" opacity="0.35" />
          <path d="M34 48h52M34 58h36" opacity="0.55" strokeLinecap="round" />
          <circle cx="60" cy="36" r="6" opacity="0.55" />
        </svg>
      </div>
      <h2 className="text-[17px] font-bold text-text-1">{title}</h2>
      {description ? (
        <p className="mx-auto mt-2 max-w-[360px] text-[13.5px] leading-[1.55] text-text-3">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
