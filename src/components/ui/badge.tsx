import type { ReactNode } from "react";

type Tone = "neutral" | "ready" | "processing" | "failed";

const tones: Record<Tone, string> = {
  neutral: "bg-sunken text-text-2 border border-border",
  ready: "bg-success-tint text-success",
  processing: "bg-info-tint text-info",
  failed: "bg-error-tint text-error",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
