import type { ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
} from "lucide-react";

const tones = {
  error: {
    className: "border-error/30 bg-error-tint text-error",
    icon: AlertCircle,
  },
  success: {
    className: "border-success/30 bg-success-tint text-success",
    icon: CheckCircle2,
  },
  info: {
    className: "border-info/30 bg-info-tint text-info",
    icon: Info,
  },
  warning: {
    className: "border-warning/30 bg-warning-tint text-warning",
    icon: TriangleAlert,
  },
} as const;

export function Alert({
  tone = "error",
  children,
  title,
}: {
  tone?: keyof typeof tones;
  children: ReactNode;
  title?: string;
}) {
  const config = tones[tone];
  const Icon = config.icon;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-sm border px-4 py-4 ${config.className}`}
    >
      <Icon
        className="mt-0.5 size-[17px] shrink-0"
        strokeWidth={1.5}
        aria-hidden
      />
      <div className="min-w-0">
        {title ? (
          <p className="mb-0.5 text-[13px] font-bold text-inherit">{title}</p>
        ) : null}
        <div className="text-[12.5px] leading-normal">{children}</div>
      </div>
    </div>
  );
}
