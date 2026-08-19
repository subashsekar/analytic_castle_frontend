import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

export function Select({
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  const invalid =
    props["aria-invalid"] === true || props["aria-invalid"] === "true";

  return (
    <div className="relative">
      <select
        className={`h-10 w-full appearance-none rounded-sm border bg-sunken px-3 pr-9 text-[13.5px] text-text-1 outline-none transition-[border-color,box-shadow,background] duration-[120ms] ease-out hover:border-text-3 focus:border-signal focus:bg-surface focus:shadow-[0_0_0_3px_var(--signal-tint)] disabled:cursor-not-allowed disabled:opacity-50 ${
          invalid ? "border-error" : "border-border-strong"
        } ${className}`}
        {...props}
      />
      <ChevronDown
        size={14}
        strokeWidth={2}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-3"
        aria-hidden
      />
    </div>
  );
}
